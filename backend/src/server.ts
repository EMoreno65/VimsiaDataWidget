import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'csv-parse/sync'; // Import the synchronous CSV parser from the csv-parse library
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';
import SftpClient from 'ssh2-sftp-client';
import Anthropic from '@anthropic-ai/sdk';

// Load .env only for local/development environments. Production platforms
// (like Railway) inject environment variables into `process.env` directly.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const pool = new pg.Pool({
  connectionString: process.env.DEV_DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const app = express();
const port = process.env.PORT || 4000; // We're using port 4000 for now, should be changed when given a real port by the hosting service

app.use(cors({ origin: [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:4000',
  'https://vimsia-data-widget.vercel.app'
 ] })); // Permission to access backend from frontend, should be changed when frontend is hosted on a different domain
app.use(express.json()); // This allows us to parse JSON bodies in requests, which is important for handling API requests that send data in JSON format

const prisma = new PrismaClient({ adapter }); // Create an instance of the Prisma Client to interact with the database
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer to store uploaded files in memory instead of saving them to disk

app.get('/', async (req, res) => {
  console.log("Root endpoint backend is running");
  res.json({ status: 'ok', message: 'Vimsia backend root endpoint' });
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected'
    });
  }
});

app.post('/api/upload-fee-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No image file uploaded' })
    }

    const imageData = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageData }
          },
          {
            type: 'text',
            text: 'Extract all grade/level and dollar fee amount pairs from this table. Return ONLY a JSON array, no markdown, no explanation. Format: [{"grade": "Toddler", "amount": 500.00}, ...]. If the left column says anything like "Primary", normalize the grade name to "Kindergarten". If it says "Toddler", or "P1" or "P2" or "P3", make the grade name PK.'
          }
        ]
      }]
    });

    const termName = req.body.term;

    const raw = message.content
      .map(block => block.type === 'text' ? block.text : '') 
      .join(' ')
      .replace(/```json|```/g, '')
      .trim();

    if (!raw) {
      throw new Error('Failed');
    }

    const rows: { grade: string; amount: number | null }[] = JSON.parse(raw);
    const validRows = rows.filter((row): row is { grade: string; amount: number } => {
      return Boolean(row.grade?.toString().trim()) && row.amount != null && !Number.isNaN(row.amount);
    });

    if (validRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid fee rows found in image' });
    }

    let updatedCount = 0;
    let createdCount = 0;

    for (const row of validRows) {
      const existing = await prisma.tuitionRate.findFirst({
        where: { grade: row.grade, termName }
      });

      if (existing) {
        await prisma.tuitionRate.update({
          where: { id: existing.id },
          data: { amount: (parseFloat(existing.amount.toString()) + row.amount).toString() }
        });
        updatedCount++;
      } else {
        await prisma.tuitionRate.create({
          data: { grade: row.grade, amount: row.amount.toString(), termName }
        });
        createdCount++;
      }
    }

    res.json({ status: 'ok', message: `Updated ${updatedCount} existing fees, created ${createdCount} new fees` });

  } catch (err) {
    console.error('Error processing fee image:', err);
    res.status(500).json({ status: 'error', message: 'Failed to process image' });
  }
    
  });

app.post('/api/upload-tuition-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No image file uploaded' });
    }

    const imageData = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: imageData }
          },
          {
            type: 'text',
            text: 'Extract all grade/level and dollar amount pairs from this table. Return ONLY a JSON array, no markdown, no explanation. Format: [{"grade": "Toddler", "amount": 10200.00}, ...]. If the left column says anything like "Primary", just make the category Kindergarten. If it says "Toddler", or "P1" or "P2" or "P3", make the category PK.'
          }
        ]
      }]
    });

    const termName = (req.body.term as string | undefined)?.trim();
    if (!termName) {
      return res.status(400).json({ status: 'error', message: 'No term selected for tuition upload' });
    }

    const raw = message.content
      .map(block => block.type === 'text' ? block.text : '')
      .join(' ')
      .replace(/```json|```/g, '')
      .trim();

    if (!raw) {
      throw new Error('Anthropic response did not include any text output');
    }
    const rows: { grade: string; amount: number | null }[] = JSON.parse(raw);

    const validRows = rows.filter((row): row is { grade: string; amount: number } => {
      return Boolean(row.grade?.toString().trim()) && row.amount != null && !Number.isNaN(row.amount);
    });

    if (validRows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid tuition rows found in OCR output' });
    }

    const data: Prisma.TuitionRateCreateManyInput[] = validRows.map(row => ({
      grade: row.grade,
      amount: row.amount.toString(),
      termName,
    }));

    const result = await prisma.tuitionRate.createMany({
      data,
      skipDuplicates: true,
    });

    if (result.count > 0) {
      res.json({ status: 'ok', message: `Inserted ${result.count} tuition rates` });
    } else {
      res.json({ status: 'ok', message: 'No new records inserted (possible duplicates)' });
    }

  } catch (err) {
    console.error('Error processing tuition image:', err);
    res.status(500).json({ status: 'error', message: 'Failed to process image' });
  }
});

app.post('/api/upload-enrollment-csv', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => { // This is an API endpoint that handles POST requests to /api/upload-enrollment-csv, expecting a single file upload with the field name 'file'
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded'});
    }

    const csvText = req.file.buffer.toString(); // Convert the uploaded file buffer to a string, which is necessary for parsing the CSV data
    const rows = parse(csvText, {
      skip_empty_lines: true, // This option tells the parser to ignore empty lines in the CSV, which can help prevent errors when processing the data
      trim: true, // This option tells the parser to trim whitespace from the beginning and end of each field, which can help clean up the data before inserting it into the database
    }) as string[][]; // We assert that the result of parsing will be an array of arrays of strings, which represents the rows and columns of the CSV data

    // const headers = rows[0]; // The first row of the CSV is assumed to contain the headers, which we will use as keys for our data objects
    const headers = rows[0].map(h => h.trim());
    // Helpful debug: show headers and a few rows so mismatched header names are obvious
    console.log('upload-enrollment-csv headers:', headers);
    console.log('upload-enrollment-csv sample rows:', rows.slice(1, 4));
    const data: Prisma.TestEnrollmentCreateManyInput[] = []; // Create an empty array to hold the data objects that we will create from the CSV rows
    rows.slice(1).forEach((row) => { // Data is gonna be filled by going through each row and doing the actions below
      // Build a loose object first to avoid strict type issues, then cast when pushing into the typed array
      const obj: any = {}; // Create an empty object to hold the data for this row
      headers.forEach((header: string, index: number) => { // This is basically going through each column title and associating the piece of data in that column with the column header
        // obj[header] = row[index];
        // console.log("current object is ", obj);
        const fieldMap: Record<string, string> = {
          'Inst Name': 'instName',
          'Student Name': 'studentName',
          'SIS Enrollment Status': 'sisEnrollmentStatus',
          'SIS Student Type': 'sisStudentType',
          'Grade': 'grade',
          'Term Name': 'termName',
        }
        const fieldName = fieldMap[header];
        if (fieldName) {
          obj[fieldName] = row[index];
        }
      })
      data.push(obj as Prisma.TestEnrollmentCreateManyInput);
    })
    // console.log("DATABASE_URL:", process.env.DEV_DATABASE_URL);

    // console.log("Data is ", data);
    const result = await prisma.testEnrollment.createMany({ // Use the Prisma Client to insert multiple records into the 'school' table in the database
      data, // The data to be inserted, which is the array of objects we created from the CSV rows
      skipDuplicates: true, // This option tells Prisma to skip inserting records that would cause a duplicate key error, which can help prevent issues when uploading the same CSV multiple times
    })
    if (result.count > 0) { // If the count of inserted records is greater than 0, it means that new records were successfully added to the database
      res.json({ status: 'ok', message: 'CSV uploaded and processed successfully' }); // Send a JSON response back to the client indicating that the CSV was uploaded and processed successfully
    }
  }  
  catch (err) {
    console.error('Error processing CSV:', err);
    res.status(500).json({ status: 'error', message: 'Failed to process CSV' });
  }
});

app.post('/api/upload-finance-csv', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => { // This is an API endpoint that handles POST requests to /api/upload-enrollment-csv, expecting a single file upload with the field name 'file'
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded'});
    }

    const termName = (req.body.term as string | undefined)?.trim();
    if (!termName) {
      return res.status(400).json({ status: 'error', message: 'No term selected for tuition upload' });
    }

    const csvText = req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
    const rows = parse(csvText, {
      skip_empty_lines: true, // This option tells the parser to ignore empty lines in the CSV, which can help prevent errors when processing the data
      trim: true, // This option tells the parser to trim whitespace from the beginning and end of each field, which can help clean up the data before inserting it into the database
      quote: '"', // explicitly handle double-quoted fields
      relax_column_count: true,    
    }) as string[][]; // We assert that the result of parsing will be an array of arrays of strings, which represents the rows and columns of the CSV data

    // const headers = rows[0]; // The first row of the CSV is assumed to contain the headers, which we will use as keys for our data objects
    const headers = rows[0].map(h => h.trim());
    const data: Prisma.FinanceDataCreateManyInput[] = []; // Create an empty array to hold the data objects that we will create from the CSV rows
    rows.slice(1).forEach((row) => { // Data is gonna be filled by going through each row and doing the actions below
      // Build a loose object first to avoid strict type issues, then cast when pushing into the typed array
      const obj: any = {}; // Create an empty object to hold the data for this row
      headers.forEach((header: string, index: number) => { // This is basically going through each column title and associating the piece of data in that column with the column header
        // obj[header] = row[index];
        // console.log("current object is ", obj);
        const fieldMap: Record<string, string> = {
          'Inst Name': 'instName',
          'Student Name': 'studentName',
          'Grade': 'grade',
          'SIS Enrollment Status': 'sisEnrollmentStatus',
          'SIS Student Type': 'sisStudentType',
          'SIS Student Status': 'sisStudentStatus', // If it says, withdrawn, add to student attrition
          'Tuition': 'tuition',
          'Financial Aid': 'financialAid',
          'Discounts - Staff': 'tuitionRemission',
        }
        const fieldName = fieldMap[header];
        if (fieldName) {
          obj[fieldName] = row[index];
        }
        
      })
      obj.termName = termName;
      data.push(obj as Prisma.FinanceDataCreateManyInput);
    })
    // console.log("DATABASE_URL:", process.env.DEV_DATABASE_URL);

    // const missingTermRows = data.filter(d => !d.termName || String(d.termName).trim() === '');
    // if (missingTermRows.length > 0) {
    //   console.error('upload-finance-csv: missing termName in', missingTermRows.length, 'rows. Sample:', missingTermRows.slice(0, 5));
    //   return res.status(400).json({ status: 'error', message: `Missing termName in ${missingTermRows.length} rows`, sample: missingTermRows.slice(0, 5) });
    // }
    // console.log("Data is ", data);
    const result = await prisma.financeData.createMany({ // Use the Prisma Client to insert multiple records into the 'school' table in the database
      data, // The data to be inserted, which is the array of objects we created from the CSV rows
      skipDuplicates: true, // This option tells Prisma to skip inserting records that would cause a duplicate key error, which can help prevent issues when uploading the same CSV multiple times
    })
    if (result.count > 0) { // If the count of inserted records is greater than 0, it means that new records were successfully added to the database
      res.json({ status: 'ok', message: 'CSV uploaded and processed successfully' }); // Send a JSON response back to the client indicating that the CSV was uploaded and processed successfully
    }
  }  
  catch (err) {
    console.error('Error processing CSV:', err);
    res.status(500).json({ status: 'error', message: 'Failed to process CSV' });
  }
});

// Chart 3.1
app.get('/api/make-tuition-grade-bar', async (req, res) => {
  const term = req.query.term as string | undefined;
  if (!term) {
    return res.status(400).json({ status: 'error', message: 'Missing term query parameter' });
  }

  const chartData: Record<string, number> = {};

  const allData = await prisma.tuitionRate.findMany({
    where: { termName: term },
    select: { grade: true, amount: true }
  })

  allData.forEach(item => {
    const grade = item.grade;
    const amount = parseFloat(item.amount.toString()) || 0;
    chartData[grade] = amount;
  })

  res.json(chartData);
});

// Chart 3.2 
app.get('/api/highest-tuition-year', async (_req, res) => {
  const result = await prisma.tuitionRate.groupBy({
    by: ['termName'],
    _max: {
      amount: true,
    },    
  });

  const chartData: Record<string, number> = {};

  result.forEach(item => {
    const term = item.termName;
    const amount = item._max.amount ? parseFloat(item._max.amount.toString()) : 0;
    chartData[term] = amount;
  });

  res.json(chartData);
});

// Chart 3.3
app.get('/api/tuition-increase-by-year', async (_req, res) => {
  try {
    const allData = await prisma.tuitionRate.findMany({
      select: { termName: true, grade: true, amount: true },
      orderBy: { termName: 'asc' } 
    });

    const termTotals: Record<string, number> = {};
    allData.forEach(row => {
      const amount = parseFloat(row.amount.toString());
      termTotals[row.termName] = (termTotals[row.termName] || 0) + amount;
    });

    const sortedTerms = Object.keys(termTotals).sort((a, b) => {
      const yearA = parseInt(a.split('-')[0]);
      const yearB = parseInt(b.split('-')[0]);
      return yearA - yearB;
    });

    const result: Record<string, number> = {};
    sortedTerms.forEach((term, i) => {
      const nextTerm = sortedTerms[i + 1];
      if (!nextTerm) return;
      const increase = parseFloat((((termTotals[nextTerm] - termTotals[term]) / termTotals[term]) * 100).toFixed(2));
      result[term] = increase;
    });

    res.json(result);

  } catch (err) {
    console.error('Error calculating tuition increase:', err);
    res.status(500).json({ status: 'error', message: 'Failed to calculate tuition increases' });
  }
});

// Chart 4.1
app.get('/api/make-finaid-multi-bar', async (_req, res) => {
  const grouped = await prisma.financeData.groupBy({
    by: ['termName', 'grade', 'financialAid', 'studentName']
  }); // Now I have a nested list of termNames with the grade and the grade is counted.

  const organized: Record<string, any> = {} // Create a record for term to grades to financial aid

  grouped.forEach(item => {
    const term = item.termName;
    const grade = item.grade;
    const financialAid = parseFloat(item.financialAid ?? '0');

    if (!organized[term]) {
      organized[term] = { // This just adds the slot for the term
        name: term
      };
    }

    if (financialAid) {
      if (organized[term][grade]) {
        organized[term][grade] += financialAid;
      }
      else {
        organized[term][grade] = financialAid;
      } 
    }
  });

  const toReturn = Object.values(organized); 

  res.json(toReturn);

});

// Chart 4.2
app.get('/api/make-finaid-single-bar', async (_req, res) => {
  const allData = await prisma.financeData.findMany({
    select: { grade: true, financialAid: true }
  });

  const chartData: Record<string, number> = {};

  allData.forEach(item => {
    const grade = item.grade;
    const aid = parseFloat(item.financialAid?.toString() || '0') || 0;
    chartData[grade] = (chartData[grade] || 0) + aid;
  });

  res.json(chartData);
});

// Chart 4.3
app.get('/api/percentage-change-finance', async (_req, res) => {
  try {
    const allData = await prisma.financeData.findMany({
      select: { termName: true, grade: true, financialAid: true },
      orderBy: { termName: 'asc' }
    });

    const totalsByTermGrade: Record<string, Record<string, number>> = {};
    const termSet = new Set<string>();
    const gradeSet = new Set<string>();

    allData.forEach(item => {
      const term = item.termName;
      const grade = item.grade;
      const financialAid = parseFloat(item.financialAid ?? '0') || 0;

      termSet.add(term);
      gradeSet.add(grade);

      if (!totalsByTermGrade[term]) {
        totalsByTermGrade[term] = {};
      }
      totalsByTermGrade[term][grade] = (totalsByTermGrade[term][grade] || 0) + financialAid;
    });

    const sortedTerms = Array.from(termSet).sort((a, b) => {
      const yearA = parseInt(a.split('-')[0]);
      const yearB = parseInt(b.split('-')[0]);
      if (Number.isNaN(yearA) || Number.isNaN(yearB)) {
        return a.localeCompare(b);
      }
      return yearA - yearB;
    });

    const sortedGrades = Array.from(gradeSet).sort((a, b) => a.localeCompare(b));

    const result: Array<Record<string, string | number | null>> = [];

    for (let i = 1; i < sortedTerms.length; i++) {
      const currentTerm = sortedTerms[i];
      const previousTerm = sortedTerms[i - 1];
      const row: Record<string, string | number | null> = { name: currentTerm };

      sortedGrades.forEach(grade => {
        const currentTotal = totalsByTermGrade[currentTerm]?.[grade] ?? 0;
        const previousTotal = totalsByTermGrade[previousTerm]?.[grade] ?? 0;

        if (previousTotal === 0) {
          row[grade] = null;
        } else {
          row[grade] = parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(2));
        }
      });

      result.push(row);
    }

    res.json(result);
  } catch (err) {
    console.error('Error calculating financial aid percentage change:', err);
    res.status(500).json({ status: 'error', message: 'Failed to calculate financial aid percentage change' });
  }
});

// Chart 4.4
app.get('/api/finaid-percent-revenue', async (_req, res) => {
  const enrollmentByGrade = await prisma.testEnrollment.groupBy({
    by: ['grade', 'termName'],
    _count: {
      grade: true
    }
  });
  const tuitionNumbers = await prisma.tuitionRate.groupBy({
    by: ['termName', 'grade', 'amount'],
  });

  const finaidNums = await prisma.financeData.groupBy({
    by: ['termName', 'financialAid']
  });

  console.log("Get to here and see what pops up under each variable");

  const studentsToTuition: Record<string, Record<string, Record<number, number>>> = {}; // Year -> Grade -> Enrollment -> Tuition

  enrollmentByGrade.forEach(item => {
    const uneditedTerm = item.termName;
    const editedTerm = uneditedTerm.replace(' School Year', '');
    let grade = item.grade;
    if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) {
      grade = 'PK';
    }
    if (['Primary'].includes(grade)) {
      grade = 'Kindergarten';
    }
    const studentsPresent = item._count.grade;
    const tuitionRecord = tuitionNumbers.find(
      t => t.termName === editedTerm && t.grade === grade
    );

    if (!studentsToTuition[editedTerm]) {
      studentsToTuition[editedTerm] = {};
    }
    if (!studentsToTuition[editedTerm][grade]) {
      studentsToTuition[editedTerm][grade] = {};
    }

    studentsToTuition[editedTerm][grade][studentsPresent] = tuitionRecord ? parseFloat(tuitionRecord.amount.toString()) : 0;
  });

  const sortedTerms = Object.keys(studentsToTuition).sort((a, b) => {
    const yearA = parseInt(a.split('-')[0], 10);
    const yearB = parseInt(b.split('-')[0], 10);
    return Number.isNaN(yearA) || Number.isNaN(yearB) ? a.localeCompare(b) : yearA - yearB;
  }).slice(1);

  // How do I remove the first entry of sortedTerms here

  const tuitionTotalsData = sortedTerms.map(term => {
    const gradeMap = studentsToTuition[term] || {};
    let termTotal = 0;

    Object.values(gradeMap).forEach(enrollmentMap => {
      Object.entries(enrollmentMap).forEach(([studentCount, tuitionAmount]) => {
        termTotal += Number(studentCount) * Number(tuitionAmount);
      });
    });

    return {
      name: term,
      value: termTotal,
    };
  });

  const financialAidRows = await prisma.financeData.findMany({
    select: { termName: true, financialAid: true }
  });

  const financialAidTotals: Record<string, number> = {};
  financialAidRows.forEach(item => {
    const term = item.termName.replace(' School Year', '');
    const aid = parseFloat(item.financialAid ?? '0') || 0;
    financialAidTotals[term] = (financialAidTotals[term] || 0) + aid;
  })

  const lineChartData = sortedTerms.map(term => {
    const normalizedTerm = term.replace(' School Year', '');
    const tuitionTotal = tuitionTotalsData.find(entry => entry.name === normalizedTerm)?.value || 0;
    const financialAidTotal = financialAidTotals[normalizedTerm] || 0;
    const value = tuitionTotal > 0 ? parseFloat(((financialAidTotal / tuitionTotal) * 100).toFixed(2)) : 0;

    return {
      name: normalizedTerm,
      value,
    };
  });

  res.json(lineChartData);
});

// Chart 4.5
app.get('/api/finaid-percent-revenue-division', async (_req, res) => {
const enrollmentByGrade = await prisma.testEnrollment.groupBy({
    by: ['grade', 'termName'],
    _count: {
      grade: true
    }
  });
  const tuitionNumbers = await prisma.tuitionRate.groupBy({
    by: ['termName', 'grade', 'amount'],
  });

  const finaidNums = await prisma.financeData.groupBy({
    by: ['termName', 'financialAid']
  });

  console.log("Get to here and see what pops up under each variable");

  const studentsToTuition: Record<string, Record<string, Record<number, number>>> = {}; // Year -> Grade -> Enrollment -> Tuition

  enrollmentByGrade.forEach(item => {
    const uneditedTerm = item.termName;
    const editedTerm = uneditedTerm.replace(' School Year', '');
    let grade = item.grade;
    if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) {
      grade = 'PK';
    }
    if (['Primary'].includes(grade)) {
      grade = 'Kindergarten';
    }
    const studentsPresent = item._count.grade;
    const tuitionRecord = tuitionNumbers.find(
      t => t.termName === editedTerm && t.grade === grade
    );

    if (!studentsToTuition[editedTerm]) {
      studentsToTuition[editedTerm] = {};
    }
    if (!studentsToTuition[editedTerm][grade]) {
      studentsToTuition[editedTerm][grade] = {};
    }

    studentsToTuition[editedTerm][grade][studentsPresent] = tuitionRecord ? parseFloat(tuitionRecord.amount.toString()) : 0;
  });

  const sortedTerms = Object.keys(studentsToTuition).sort((a, b) => {
    const yearA = parseInt(a.split('-')[0], 10);
    const yearB = parseInt(b.split('-')[0], 10);
    return Number.isNaN(yearA) || Number.isNaN(yearB) ? a.localeCompare(b) : yearA - yearB;
  }).slice(1);

  // How do I remove the first entry of sortedTerms here

  const tuitionTotalsData = sortedTerms.map(term => {
    const gradeMap = studentsToTuition[term] || {};
    let termTotal = 0;

    Object.values(gradeMap).forEach(enrollmentMap => {
      Object.entries(enrollmentMap).forEach(([studentCount, tuitionAmount]) => {
        termTotal += Number(studentCount) * Number(tuitionAmount);
      });
    });

    return {
      name: term,
      value: termTotal,
    };
  });

  const financialAidRows = await prisma.financeData.findMany({
    select: { termName: true, financialAid: true, grade: true }
  });

  const financialAidTotals: Record<string, Record<string, number>> = {};
  financialAidRows.forEach(item => {
    let division = 'Undefined';
    if (['Toddler', 'P1', 'P2', 'P3', 'La Casa', 'Primary', '1st', '2nd', '3rd', '4th', '5th'].includes(item.grade)) {
      division = 'Lower';
    }
    if (['6th', '7th', '8th'].includes(item.grade)) {
      division = 'Middle';
    }
    if (['9th', '10th', '11th', '12th'].includes(item.grade)) {
      division = 'Upper';
    }
    const term = item.termName.replace(' School Year', '');
    const aid = parseFloat(item.financialAid ?? '0') || 0;
    if (!financialAidTotals[term]) {
      financialAidTotals[term] = {};
    }
    financialAidTotals[term][division] = (financialAidTotals[term][division] || 0) + aid;
  });

  const lineChartData = sortedTerms.map(term => {
    const tuitionTotal = tuitionTotalsData.find(entry => entry.name === term)?.value || 0;
    const divisions = ['Lower', 'Middle', 'Upper'];

    const entry: Record<string, string | number> = { name: term };
    divisions.forEach(division => {
      const financialAidTotal = financialAidTotals[term]?.[division] || 0;
      const value = tuitionTotal > 0 ? parseFloat(((financialAidTotal / tuitionTotal) * 100).toFixed(2)) : 0;
      entry[division] = value;
    });
    return entry;

});
  res.json(lineChartData); 
});

// Chart 4.6
app.get('/api/finaid-percent-revenue-grade', async (req, res) => {
  try {
    const term = (req.query.term as string) || '';
    if (!term) {
      return res.status(400).json({ message: 'term query param required, e.g. ?term=2024-2025' });
    }

    // Accept both stored variants: '2024-2025' or '2024-2025 School Year'
    const termVariants = [term, `${term} School Year`];

    // Enrollment counts by grade for the term
    const enrollmentGroups = await prisma.testEnrollment.groupBy({
      by: ['grade'],
      where: { termName: { in: termVariants } },
      _count: { grade: true }
    });
    const counts: Record<string, number> = {};
    enrollmentGroups.forEach(g => {
      let grade = g.grade;
      if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) grade = 'PK';
      if (grade === 'Primary') grade = 'Kindergarten';
      counts[grade] = (counts[grade] || 0) + g._count.grade;
    });

    // Tuition amount per grade for the term
    const tuitionRows = await prisma.tuitionRate.findMany({ where: { termName: { in: termVariants } }, select: { grade: true, amount: true } });
    const tuitionMap: Record<string, number> = {};
    tuitionRows.forEach(t => {
      let grade = t.grade;
      if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) grade = 'PK';
      if (grade === 'Primary') grade = 'Kindergarten';
      tuitionMap[grade] = Number(t.amount ?? 0);
    });

    // Financial aid sums by grade for the term
    const aidRows = await prisma.financeData.findMany({ where: { termName: { in: termVariants } }, select: { grade: true, financialAid: true } });
    const aidMap: Record<string, number> = {};
    aidRows.forEach(a => {
      let grade = a.grade;
      if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) grade = 'PK';
      if (grade === 'Primary') grade = 'Kindergarten';
      const aid = parseFloat(a.financialAid ?? '0') || 0;
      aidMap[grade] = (aidMap[grade] || 0) + aid;
    });

    // Build result: grade -> percent of tuition revenue covered by aid
    const grades = new Set<string>([...Object.keys(counts), ...Object.keys(tuitionMap), ...Object.keys(aidMap)]);
    const result: Record<string, number> = {};
    grades.forEach(g => {
      const studentCount = counts[g] || 0;
      const perStudentTuition = tuitionMap[g] || 0;
      const tuitionRevenue = studentCount * perStudentTuition;
      const aidTotal = aidMap[g] || 0;
      const percent = tuitionRevenue > 0 ? parseFloat(((aidTotal / tuitionRevenue) * 100).toFixed(2)) : 0;
      result[g] = percent;
    });

    return res.json(result);
  } catch (err) {
    console.error('Error /api/finaid-percent-revenue-grade', err);
    return res.status(500).json({ message: 'internal error' });
  }
});

// Chart 4.7
app.get('/api/finaid-rewards-by-grade', async (req, res) => {
  const term = (req.query.term as string) || '';
  if (!term) {
    return res.status(400).json({ message: 'term query param required, e.g. ?term=2024-2025' });
  }

  const finaidRows = await prisma.financeData.findMany({
    where: {
      termName: term,
      financialAid: {
        not: null
      }
    },
    select: {
      grade: true,
      studentName: true,
      financialAid: true
    }
  });

  const chartData: Record<string, number> = {};
  const countedStudents = new Set<string>();

  finaidRows.forEach(item => {
    const grade = item.grade;
    const financialAid = (item.financialAid ?? '').trim();
    if (!financialAid) {
      return;
    }

    const studentKey = `${grade}::${item.studentName}`;
    if (countedStudents.has(studentKey)) {
      return;
    }

    countedStudents.add(studentKey);
    chartData[grade] = (chartData[grade] || 0) + 1;
  });

  res.json(chartData);
});

// Chart 4.8
app.get('/api/finaid-rewards-by-percent', async (req, res) => {
  const term = (req.query.term as string) || '';
  if (!term) {
    return res.status(400).json({ message: 'term query param required, e.g. ?term=2024-2025' });
  }

  const finaidRows = await prisma.financeData.findMany({
    where: {
      termName: term,
      financialAid: {
        not: null
      }
    },
    select: {
      grade: true,
      studentName: true,
      financialAid: true
    }
  });

  const tuitionData = await prisma.tuitionRate.findMany({
    where: { termName: term },
    select: { grade: true, amount: true }
  });

  const pieChartData: Record<string, number> = {};
  const countedStudents = new Set<string>();

  finaidRows.forEach(item => {
    const grade = item.grade;
    const financialAid = (item.financialAid ?? '').trim();
    if (!financialAid) {
      return;
    }

    const tuitionRecord = tuitionData.find(
      t => t.grade === grade
    );

    if (!tuitionRecord?.amount) {
      return;
    }
    const percentage = parseFloat(financialAid) / parseFloat(tuitionRecord?.amount.toString()); 
    let percentString = '';
    if (percentage < 0.25) {
      percentString = '<25%';
    }
    if (percentage >= 0.25 && percentage <= 0.49) {
      percentString = '25%-49%';
    }
    if (percentage >= 0.50 && percentage <= 0.74) {
      percentString = '50%-74%';
    }
    if (percentage >= 0.75) {
      percentString = '>75%';
    }

    const studentKey = `${grade}::${item.studentName}`;
    if (countedStudents.has(studentKey)) {
      return;
    }

    countedStudents.add(studentKey);
    pieChartData[percentString] = (pieChartData[percentString] || 0) + 1;
  });

  res.json(pieChartData);

});

// Chart 4.9
app.get('/api/tuition-remission-by-term', async (req, res) => {
  const remissionRows = await prisma.financeData.findMany({
    where: {
      tuitionRemission: {
        not: null
      }
    },
    select: {
      termName: true,
      tuitionRemission: true,
    },
  });

  const totals: Record<string, number> = {};

  remissionRows.forEach(item => {
    const rawValue = (item.tuitionRemission ?? '').trim();
    if (!rawValue) {
      return;
    }

    const numericValue = Number.parseFloat(rawValue.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(numericValue)) {
      return;
    }

    totals[item.termName] = (totals[item.termName] || 0) + numericValue;
  });

  // const result = Object.entries(totals).map(([termName, totalTuitionRemission]) => ({
  //   termName,
  //   totalTuitionRemission: Number(totalTuitionRemission.toFixed(2)),
  // }));

  res.json(totals);
});

// Chart 4.10
app.get('/api/tuition-remission-percent-gross', async (_req, res) => {
  const normalizeNumber = (value: string | null | undefined) => {
    const rawValue = (value ?? '').trim();
    if (!rawValue) {
      return 0;
    }

    const numericValue = Number.parseFloat(rawValue.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const normalizeGrade = (grade: string) => {
    if (['Toddler', 'P1', 'P2', 'P3', 'La Casa'].includes(grade)) {
      return 'PK';
    }
    if (grade === 'Primary') {
      return 'Kindergarten';
    }
    return grade;
  };

  const normalizeTerm = (term: string | null | undefined) => {
    if (!term) {
      return '';
    }

    return term.includes(' School Year') ? term : `${term} School Year`;
  };

  const financeTerms = await prisma.financeData.findMany({
    select: { termName: true },
    distinct: ['termName']
  });
  const tuitionTerms = await prisma.tuitionRate.findMany({
    select: { termName: true },
    distinct: ['termName']
  });
  const enrollmentTerms = await prisma.testEnrollment.findMany({
    select: { termName: true },
    distinct: ['termName']
  });

  const termNames = Array.from(new Set([
    ...financeTerms.map(item => item.termName),
    ...tuitionTerms.map(item => item.termName),
    ...enrollmentTerms.map(item => item.termName)
  ]));

  const lineData: Array<{ name: string; value: number }> = [];

  for (const termName of termNames) {
    const normalizedTermName = normalizeTerm(termName);
    const termVariants = [termName, normalizedTermName].filter(Boolean);

    const remissionRows = await prisma.financeData.findMany({
      where: {
        termName: { in: termVariants },
        tuitionRemission: {
          not: null
        }
      },
      select: {
        tuitionRemission: true
      }
    });

    const remissionTotal = remissionRows.reduce((sum, item) => {
      return sum + normalizeNumber(item.tuitionRemission);
    }, 0);

    const enrollmentGroups = await prisma.testEnrollment.groupBy({
      by: ['grade'],
      where: { termName: { in: termVariants } },
      _count: { grade: true }
    });

    const counts: Record<string, number> = {};
    enrollmentGroups.forEach(group => {
      const normalizedGrade = normalizeGrade(group.grade);
      counts[normalizedGrade] = (counts[normalizedGrade] || 0) + group._count.grade;
    });

    const tuitionRows = await prisma.tuitionRate.findMany({
      where: { termName: { in: termVariants } },
      select: { grade: true, amount: true }
    });

    const tuitionMap: Record<string, number> = {};
    tuitionRows.forEach(row => {
      const normalizedGrade = normalizeGrade(row.grade);
      tuitionMap[normalizedGrade] = Number(row.amount ?? 0);
    });

    let grossTuition = 0;
    Object.entries(counts).forEach(([grade, studentCount]) => {
      const perStudentTuition = tuitionMap[grade] || 0;
      grossTuition += studentCount * perStudentTuition;
    });

    const percent = grossTuition > 0 ? Number(((remissionTotal / grossTuition) * 100).toFixed(2)) : 0;

    if (remissionTotal > 0 || grossTuition > 0) {
      lineData.push({
        name: termName,
        value: percent,
      });
    }
  }

  lineData.sort((a, b) => a.name.localeCompare(b.name));
  res.json(lineData);
});


// Chart 2.1
app.get('/api/make-enrollment-multi-bar', async (_req, res) => { // This goes into the database and collects data, not sure the specifics yet
  console.log('Received request for multi bar chart data and it is: ', _req.body);
  // res.json({ status: 'ok', message: 'Chart generation endpoint - to be implemented' });
  const grouped = await prisma.testEnrollment.groupBy({
    by: ['termName', 'grade'],
    _count: {
      grade: true, // This means the number of people in each grade is counted for each term year
    }
  });

  const transformed: Record<string, any> = {};

  grouped.forEach(item => {
    const term = item.termName;
    const grade = item.grade;
    const count = item._count.grade;

    // Create row if it doesn't exist yet
    if (!transformed[term]) {
      transformed[term] = {
        termName: term
      };
    }

    // Add grade count dynamically
    transformed[term][grade] = count;
  });

  const chartData = Object.values(transformed);

  res.json(chartData); // Send the chart data back to the client as a JSON response, which will be used to render the charts on the frontend)
}
);

// Chart 2.3
app.get('/api/make-enrollment-line-capacity', async (_req, res) => {
  const grade_capacities = {
    '1st': 20, '2nd': 20, '3rd': 20, '4th': 20, '5th': 20,
    '6th': 24, '7th': 24, '8th': 24, '9th': 24,
    '10th': 24, '11th': 24, '12th': 24,
  };

  const grouped = await prisma.testEnrollment.groupBy({
    by: ['termName', 'grade'],
    _count: { grade: true }
  });

  const termTotals: Record<string, { enrolled: number; capacity: number }> = {};

  grouped.forEach(item => {
    const term = item.termName;
    const grade = item.grade;
    const count = item._count.grade;
    const capacity = grade_capacities[grade as keyof typeof grade_capacities] ?? 0;

    if (!termTotals[term]) {
      termTotals[term] = { enrolled: 0, capacity: 0 };
    }

    termTotals[term].enrolled += count;
    termTotals[term].capacity += capacity;
  });

  const chartData = Object.entries(termTotals)
    .map(([term, { enrolled, capacity }]) => ({
      name: term,
      value: capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); 

  res.json(chartData);
});

// Chart 2.2
app.get('/api/make-enrollment-line-division', async (_req, res) => {

  const gradeDivisionMap: Record<string, string> = {
    toddler: 'Casa',
    primary: 'Primary',

    '1st': 'LE',
    '2nd': 'LE',
    '3rd': 'LE',
    '4th': 'UE',
    '5th': 'UE',
    '6th': 'MYP',
    '7th': 'MYP',
    '8th': 'MYP',
    '9th': 'MYP',
    '10th': 'MYP',
    '11th': 'DP',
    '12th': 'DP',
  };

  const grouped = await prisma.testEnrollment.groupBy({
    by: ['termName', 'grade'],
    _count: {
      grade: true,
    },
  });

  const termTotals: Record<string, Record<string, number>> = {};

  grouped.forEach(item => {
    const term = item.termName;
    const grade = item.grade;
    const count = item._count.grade;

    const division = gradeDivisionMap[grade];

    if (!division) return;

    if (!termTotals[term]) {
      termTotals[term] = {
        'Casa': 0,
        'Primary': 0,
        'LE': 0,
        'UE': 0,
        'MYP': 0,
        'DP': 0,
      };
    }

    termTotals[term][division] += count;
  });

  const chartData = Object.entries(termTotals)
    .map(([term, divisions]) => ({
      name: term,
      ...divisions,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(chartData);
});

// Chart 2.4
app.get('/api/make-multibar-enrollment-division', async (_req, res) => {

  const gradeDivisionMap: Record<string, string> = {
    toddler: 'Casa',
    primary: 'Primary',

    '1st': 'LE',
    '2nd': 'LE',
    '3rd': 'LE',
    '4th': 'UE',
    '5th': 'UE',
    '6th': 'MYP',
    '7th': 'MYP',
    '8th': 'MYP',
    '9th': 'MYP',
    '10th': 'MYP',
    '11th': 'DP',
    '12th': 'DP',
  };

  const grouped = await prisma.testEnrollment.groupBy({
    by: ['termName', 'grade'],
    _count: {
      grade: true,
    },
  });

  const termTotals: Record<string, Record<string, number>> = {};

  grouped.forEach(item => {
    const term = item.termName;
    const grade = item.grade;
    const count = item._count.grade;

    const division = gradeDivisionMap[grade];

    if (!division) return;

    if (!termTotals[term]) {
      termTotals[term] = {
        'Casa': 0,
        'Primary': 0,
        'LE': 0,
        'UE': 0,
        'MYP': 0,
        'DP': 0,
      };
    }

    termTotals[term][division] += count;
  });

  const divisions = ['Casa', 'Primary', 'LE', 'UE', 'MYP', 'DP'];
  const terms = Object.keys(termTotals).sort((a, b) => a.localeCompare(b)); // Sort terms alphabetically to ensure consistent order

  const chartData = divisions.map(division => {
    const entry: Record<string, string | number> = { name: division }; // The 'name' field is used by the chart to identify each group
    terms.forEach(term => {
      entry[term] = termTotals[term]?.[division] ?? 0; // Add the count for this division and term, or 0 if there is no data
    })
    return entry;
  })

  res.json({ chartData, terms }); // Send the chart data and the list of terms back to the client as a JSON response, which will be used to render the multi-bar chart on the frontend
});

app.get('/api/hello', (_req, res) => { // This is a simple API endpoint that responds to GET requests at /api/hello
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => { // Start the server and listen on the specified port
  console.log(`Backend server listening on port ${port}`);
});

// async function pollSftp() {
//   const sftp = new SftpClient();
//   try {
//     await sftp.connect({
//       host: process.env.SFTP_HOST,
//       port: 22,
//       username: process.env.SFTP_USERNAME,
//       password: process.env.SFTP_PASSWORD,
//     });

//     const files = await sftp.list(process.env.SFTP_UPLOAD_DIR!);
//     const csvFiles = files.filter(f => f.name.endsWith('.csv'));

//     if (csvFiles.length === 0) {
//       console.log('No new CSV files found');
//       return;
//     }

//     for (const file of csvFiles) {
//       const remotePath = `${process.env.SFTP_UPLOAD_DIR}/${file.name}`;
//       const processedPath = `${process.env.SFTP_PROCESSED_DIR}/${file.name}`;

//       console.log(`Processing: ${file.name}`);
//       const fileBuffer = await sftp.get(remotePath) as Buffer;

//       const csvText = fileBuffer.toString();
//       const rows = parse(csvText, {
//         skip_empty_lines: true,
//         trim: true,
//       }) as string[][];

//       const headers = rows[0].map(h => h.trim());
//       const data: any[] = [];

//       rows.slice(1).forEach((row) => {
//         const obj: any = {};
//         const fieldMap: Record<string, string> = {
//           'Inst Name': 'instName',
//           'Student Name': 'studentName',
//           'SIS Enrollment Status': 'sisEnrollmentStatus',
//           'SIS Student Type': 'sisStudentType',
//           'Grade': 'grade'
//         };
//         headers.forEach((header, index) => {
//           const fieldName = fieldMap[header];
//           if (fieldName) obj[fieldName] = row[index];
//         });
//         data.push(obj);
//       });

//       await prisma.testEnrollment.createMany({
//         data,
//         skipDuplicates: true,
//       });

//       await sftp.rename(remotePath, processedPath);
//       console.log(`Done: ${file.name}`);
//     }
//   } catch (err) {
//     console.error('SFTP poll error:', err);
//   } finally {
//     await sftp.end();
//   }
// }

// cron.schedule('0 2 * * *', () => {
//   console.log('Running nightly SFTP poll...');
//   pollSftp();
// });

export default app; 
