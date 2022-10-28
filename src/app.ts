import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import versionRoutes from './routes/version';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import { dbCheck } from './db/database';
import logger from './logger/_logger';
import { appErrorRequestHandler } from './helpers/custom-errors';

const app = express();
app.use(bodyParser.json());

const port: number = config.get('App.port');
const host: string = config.get('App.host');

app.use(versionRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.use(appErrorRequestHandler);

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
