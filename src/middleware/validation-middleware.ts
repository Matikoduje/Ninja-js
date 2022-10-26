import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { appErrorHandler } from '../handlers/custom-errors';

const validationMiddleware = (schema: ObjectSchema) => {
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

export default validationMiddleware;
