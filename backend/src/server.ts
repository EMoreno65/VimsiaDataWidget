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

// Load .env from the workspace root (parent of backend directory)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BACKEND_URL = process.env.VITE_API_URL;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const app = express();
const port = process.env.PORT || 4000; // We're using port 4000 for now, should be changed when given a real port by the hosting service

app.use(cors({ origin: BACKEND_URL })); // Permission to access backend from frontend, should be changed when frontend is hosted on a different domain
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

app.post('/api/upload-csv', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res: Response) => { // This is an API endpoint that handles POST requests to /api/upload-csv, expecting a single file upload with the field name 'file'
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
          'Grade': 'grade'
        }
        const fieldName = fieldMap[header];
        if (fieldName) {
          obj[fieldName] = row[index];
        }
      })
      data.push(obj as Prisma.TestEnrollmentCreateManyInput);
    })
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

app.get('/api/make-chart', async (_req, res) => { // This goes into the database and collects data, not sure the specifics yet
  console.log('Received request for chart data and it is: ', _req.body);
  // res.json({ status: 'ok', message: 'Chart generation endpoint - to be implemented' });
  const grouped = await prisma.testEnrollment.groupBy({
    by: ['sisEnrollmentStatus'],
    _count: {
      sisEnrollmentStatus: true
    }
  });

  type Grouped = {
    sisEnrollmentStatus: string;
    _count: {
      sisEnrollmentStatus: number;
    };
  };

  const typedGrouped = grouped as Grouped[];

  const chartData = typedGrouped.map(item => ({ 
    name: item.sisEnrollmentStatus, value: item._count.sisEnrollmentStatus 
  }))

  res.json(chartData); // Send the chart data back to the client as a JSON response, which will be used to render the charts on the frontend)
}
);

app.get('/api/hello', (_req, res) => { // This is a simple API endpoint that responds to GET requests at /api/hello
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => { // Start the server and listen on the specified port
  console.log(`Backend server listening on port ${port}`);
});

export default app; 
