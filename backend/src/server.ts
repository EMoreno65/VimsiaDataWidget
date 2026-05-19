import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Vimsia backend running' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server listening on port ${port}`);
});
