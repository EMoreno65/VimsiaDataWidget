import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync'; // Import the synchronous CSV parser from the csv-parse library

const app = express();
const port = process.env.PORT || 4000; // We're using port 4000 for now, should be changed when given a real port by the hosting service

app.use(cors({ origin: 'http://localhost:3001' })); // Permission to access backend from frontend, should be changed when frontend is hosted on a different domain
app.use(express.json()); // This allows us to parse JSON bodies in requests, which is important for handling API requests that send data in JSON format

const prisma = new PrismaClient({ adapter: 'prisma' }); // Create an instance of the Prisma Client to interact with the database
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer to store uploaded files in memory instead of saving them to disk

app.post('api/upload-csv', upload.single('file'), async (req, res) => { // This is an API endpoint that handles POST requests to /api/upload-csv, expecting a single file upload with the field name 'file'
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded'});
    }

    const csvText = req.file.buffer.toString(); // Convert the uploaded file buffer to a string, which is necessary for parsing the CSV data
    const rows = parse(csvText, {
      columns: true, // This option tells the parser to treat the first row of the CSV as column headers, which allows us to access values by column name
      skip_empty_lines: true, // This option tells the parser to ignore empty lines in the CSV, which can help prevent errors when processing the data
      trim: true, // This option tells the parser to trim whitespace from the beginning and end of each field, which can help clean up the data before inserting it into the database
    }) as Record<string, string>[]; // We assert the type of the parsed rows as an array of records where each record is an object with string keys and string values

    const data = rows.map((row) => ({
      name: row['name'], // Map the 'name' column from the CSV to the 'name' field in our database model
    }));

    const result = await prisma.school.createMany({ // Use the Prisma Client to insert multiple records into the 'school' table in the database
      data, // The data to be inserted, which is the array of objects we created from the CSV rows
      skipDuplicates: true, // This option tells Prisma to skip inserting records that would cause a duplicate key error, which can help prevent issues when uploading the same CSV multiple times
    })
    res.json({ status: 'ok', message: 'CSV uploaded and processed successfully' }); // Send a JSON response back to the client indicating that the CSV was uploaded and processed successfully
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
