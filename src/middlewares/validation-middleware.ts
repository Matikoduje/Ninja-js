import { Request, Response, NextFunction } from 'express';
import { ObjectSchema, ValidationError } from 'joi';
import { StatusCodeError } from '../handlers/custom-errors';

const validationMiddleware = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err) {
      let errorMessage = 'Provided data was failed due to validation.';
      if (err instanceof ValidationError) {
        errorMessage = err.details.map((detail) => detail.message).join('. ');
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      const error = new StatusCodeError(errorMessage);
      error.statusCode = 422;
      return next(error);
    }
  };
};

export default validationMiddleware;
