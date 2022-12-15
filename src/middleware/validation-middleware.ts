import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';

export const validationMiddleware = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err) {
      const error = appErrorHandler(err);
      return next(error);
    }
  };
};

export const validationUpdateMiddleware = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.updateParams);
      return next();
    } catch (err) {
      const error = appErrorHandler(err);
      return next(error);
    }
  };
};

export const getEtagFromHeader = (req: Request) => {
  let etag;
  if (req.headers['if-match']) {
    etag = req.headers['if-match'];
  }
  if (!etag) {
    throw new StatusCodeError(
      'A required header if-match is missing. In if-match header you should set etag value.',
      400
    );
  }

  return etag;
};

export const getEtagFromSyncHeader = (req: Request) => {
  let etag;
  if (req.headers['if-none-match']) {
    etag = req.headers['if-none-match'];
  }
  if (!etag) {
    throw new StatusCodeError(
      'A required header if-none-match is missing. In if-none-match header you should set etag value.',
      400
    );
  }

  return etag;
};

export default validationMiddleware;
