import express from 'express';

import config from 'config';
import routes from './routes/ninja';
import { dbCheck } from './db/database';
import logger from './logger/_logger';

const app = express();
const port: number = config.get('App.port');
const host: string = config.get('App.host');
app.use(routes);

async function startServer() {
  try {
    const dbCheckResult = await dbCheck();
    logger.info(dbCheckResult);
  } catch (error) {
    logger.error({ err: error });
  } finally {
    app.listen(port, () => {
      logger.info(`Server is listening on http://${host}:${port}`);
      logger.trace('App is working in development environment.');
    });
  }
}

startServer();
