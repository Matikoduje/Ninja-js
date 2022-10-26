import express, {
  Request,
  Response,
  ErrorRequestHandler,
  NextFunction
} from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import versionRoutes from './routes/version';
import userRoutes from './routes/user';
import { dbCheck } from './db/database';
import logger from './logger/_logger';

const app = express();
app.use(bodyParser.json());

const port: number = config.get('App.port');
const host: string = config.get('App.host');

const errorRequestHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const { message } = err;
  const validationError = err.validationError || '';
  const errorOutput = {
    message,
    validationError
  };
  res.status(statusCode).json(errorOutput);
};

app.use(versionRoutes);
app.use(userRoutes);
app.use(errorRequestHandler);

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
