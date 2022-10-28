import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { appErrorHandler } from '../helpers/custom-errors';
import User from '../models/user';
import RequestHandler from '../helpers/custom-request';

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
  const userId = RequestHandler.getUserIdFromParams(req);

  try {
    const user = await User.loadUserById(userId);
    req.user = user;
    return next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};

export default validationMiddleware;
