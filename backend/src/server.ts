import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { parse } from 'csv-parse/sync'; // Import the synchronous CSV parser from the csv-parse library
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const app = express();
const port = process.env.PORT || 4000; // We're using port 4000 for now, should be changed when given a real port by the hosting service

app.use(cors({ origin: 'http://localhost:3001' })); // Permission to access backend from frontend, should be changed when frontend is hosted on a different domain
app.use(express.json()); // This allows us to parse JSON bodies in requests, which is important for handling API requests that send data in JSON format

const prisma = new PrismaClient({ adapter }); // Create an instance of the Prisma Client to interact with the database
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer to store uploaded files in memory instead of saving them to disk

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

    const headers = rows[0]; // The first row of the CSV is assumed to contain the headers, which we will use as keys for our data objects
    const data = rows.slice(1).map((row) => { // Data is gonna be filled by going through each row and doing the actions below
      const obj: Record<string, string> = {}; // Create an empty object to hold the data for this row>
      headers.forEach((header: string, index: number) => { // This is basically going through each column title and associating the piece of data in that column with the column header
        obj[header] = row[index];
        return obj; // Returning it will add it to the data
      })
    })
    const result = await prisma.school.createMany({ // Use the Prisma Client to insert multiple records into the 'school' table in the database
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

app.get('/api/hello', (_req, res) => { // This is a simple API endpoint that responds to GET requests at /api/hello
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => { // Start the server and listen on the specified port
  console.log(`Backend server listening on port ${port}`);
});
