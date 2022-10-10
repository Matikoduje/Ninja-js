import express from 'express';

import config from 'config';
import routes from './routes/ninja';
import { dbCheck } from './db/database';

const app = express();
const port: number = config.get('App.port');
const host: string = config.get('App.host');
app.use(routes);

async function startServer() {
  try {
    const dbCheckResult = await dbCheck();
    console.log(dbCheckResult);
  } catch (error) {
    console.error(error);
  } finally {
    app.listen(port, () => {
      console.log(`Server is listening on http://${host}:${port}`);
    });
  }
}

startServer();
