import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodeError, appErrorHandler } from '../handlers/custom-errors';
import config from 'config';
import User from '../models/user';
import Role from '../models/role';
import { RequestHandler } from '../handlers/request-helper';

const accessTokenSecret: string = config.get('App.accessTokenSecret');

export const isUserAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestTokenHeader = 'Authorization';
  const token = req.header(requestTokenHeader);

  if (!token) {
    throw new StatusCodeError(
      `Required ${requestTokenHeader} header not found.`,
      401
    );
  }

  jwt.verify(token, accessTokenSecret, (err) => {
    if (err) {
      throw new StatusCodeError(
        'Failed to decode or validate authorization token.',
        401
      );
    }
  });

  const decodedToken = jwt.decode(token) as { id: number };
  const { id } = decodedToken;

  if (id === undefined) {
    throw new StatusCodeError(
      'Failed to decode or validate authorization token.',
      401
    );
  }

  req.requestedUserId = id;
  req.verificationToken = token;
  next();
};

export const isUserTokenValid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { requestedUserId, verificationToken } = req;

  try {
    const userUsedValidToken = await User.isTokenValid(
      requestedUserId,
      verificationToken
    );
    if (!userUsedValidToken) {
      throw new StatusCodeError('Provided token is not valid.', 401);
    }
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }

  next();
};

export const isUserAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { requestedUserId } = req;
  const userId = RequestHandler.getUserIdFromParams(req);

  try {
    const adminRoleId = await Role.getRoleIdByName('admin');
    const userRoleId = await Role.getRoleIdByName('user');

    const isAdmin = await Role.hasUserRole(requestedUserId, adminRoleId);
    if (isAdmin) {
      return next();
    }

    const isUser = await Role.hasUserRole(requestedUserId, userRoleId);
    if (isUser && userId === requestedUserId) {
      return next();
    }
    throw new StatusCodeError(
      'You are not authorized to perform this action.',
      403
    );
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
