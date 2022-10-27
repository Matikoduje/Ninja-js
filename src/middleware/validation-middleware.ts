import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { appErrorHandler, StatusCodeError } from '../handlers/custom-errors';
import User from '../models/user';

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

export const validateUserIdFromParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { requestedUserId } = req;

  try {
    const isUserExists = await User.isUserExists(requestedUserId);
    if (isUserExists) {
      return next();
    }
    throw new StatusCodeError('User Not Found', 404);
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};

export default validationMiddleware;
