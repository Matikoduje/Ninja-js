import config from 'config';
import { dbCheck } from './db/database';
import logger from './logger/_logger';
import app from './app/_app';

const port: number = config.get('App.port');
const host: string = config.get('App.host');

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
