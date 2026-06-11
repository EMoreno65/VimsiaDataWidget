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

// Load .env only for local/development environments. Production platforms
// (like Railway) inject environment variables into `process.env` directly.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

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
    console.log("DATABASE_URL:", process.env.DEV_DATABASE_URL);

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

    const csvText = req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
    const rows = parse(csvText, {
      skip_empty_lines: true, // This option tells the parser to ignore empty lines in the CSV, which can help prevent errors when processing the data
      trim: true, // This option tells the parser to trim whitespace from the beginning and end of each field, which can help clean up the data before inserting it into the database
      quote: '"', // explicitly handle double-quoted fields
      relax_column_count: true,    
    }) as string[][]; // We assert that the result of parsing will be an array of arrays of strings, which represents the rows and columns of the CSV data

    // const headers = rows[0]; // The first row of the CSV is assumed to contain the headers, which we will use as keys for our data objects
    const headers = rows[0].map(h => h.trim());
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
          'Grade': 'grade',
          'Term Name': 'termName',
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
      data.push(obj as Prisma.TestEnrollmentCreateManyInput);
    })
    console.log("DATABASE_URL:", process.env.DEV_DATABASE_URL);

    // const missingTermRows = data.filter(d => !d.termName || String(d.termName).trim() === '');
    // if (missingTermRows.length > 0) {
    //   console.error('upload-finance-csv: missing termName in', missingTermRows.length, 'rows. Sample:', missingTermRows.slice(0, 5));
    //   return res.status(400).json({ status: 'error', message: `Missing termName in ${missingTermRows.length} rows`, sample: missingTermRows.slice(0, 5) });
    // }
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




// Chart 2.1
app.get('/api/make-enrollment-multi-bar', async (_req, res) => { // This goes into the database and collects data, not sure the specifics yet
  console.log('Received request for multi bar chart data and it is: ', _req.body);
  // res.json({ status: 'ok', message: 'Chart generation endpoint - to be implemented' });
  const grouped = await prisma.testEnrollment.groupBy({
    by: ['termName', 'grade'],
    _count: {
      grade: true,
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
