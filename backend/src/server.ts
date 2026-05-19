import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
