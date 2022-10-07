import { Client } from 'pg';
import express from 'express';

import trainingRoutes from './routes/training';

const client = new Client({
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  host: process.env.DB_HOST
});

const app = express();
const port = 8080;

app.use(trainingRoutes);

(async () => {
  await client.connect();

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
