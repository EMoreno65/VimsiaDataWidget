import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000; // We're using port 4000 for now, should be changed when given a real port by the hosting service

app.use(cors({ origin: 'http://localhost:3001' })); // Permission to access backend from frontend, should be changed when frontend is hosted on a different domain
app.use(express.json()); // This allows us to parse JSON bodies in requests, which is important for handling API requests that send data in JSON format

app.get('/api/hello', (_req, res) => { // This is a simple API endpoint that responds to GET requests at /api/hello
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => { // Start the server and listen on the specified port
  console.log(`Backend server listening on port ${port}`);
});
