import { Request, Response, NextFunction } from 'express';
import { ObjectSchema, ValidationError } from 'joi';
import { StatusCodeValidationError } from '../handlers/custom-errors';

const validationMiddleware = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body);
      return next();
    } catch (err) {
      if (err instanceof ValidationError) {
        const error = new StatusCodeValidationError(
          'Provided data is invalid due to validation requirements.'
        );
        error.statusCode = 422;
        error.validationError = err.details
          .map((detail) => detail.message)
          .join('. ');
        return next(error);
      }
    }
  };
};

export default validationMiddleware;
