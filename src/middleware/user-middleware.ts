import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import RequestHandler from '../handlers/request-handler';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import { getEtagFromHeader } from './validation-middleware';

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

export const validateUserEtag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let etag;

  try {
    etag = getEtagFromHeader(req);

    const { user } = req;
    const userEtag = user.getEtag();
    if (userEtag !== etag) {
      throw new StatusCodeError(
        'The attached Etag does not reflect the current state of the user. The action will not be performed.',
        412
      );
    }
    next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};
