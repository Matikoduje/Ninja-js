import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodeError, appErrorHandler } from '../helpers/custom-errors';
import config from 'config';
import User from '../models/user';
import Role from '../models/role';
import RequestHandler from '../helpers/custom-request';

const accessTokenSecret: string = config.get(
  'App.jsonWebTokensConfiguration.accessTokenSecret'
);

const requestTokenHeader: string = config.get(
  'App.jsonWebTokensConfiguration.header'
);

export const isUserAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
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
    await User.isTokenValid(id, token);
    req.authenticatedUserId = id;
    return next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};

export const isUserAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authenticatedUserId } = req;
  const userId = RequestHandler.getUserIdFromParams(req);

  try {
    const adminRoleId = await Role.getRoleIdByName('admin');
    const userRoleId = await Role.getRoleIdByName('user');

    const isAdmin = await Role.hasUserRole(authenticatedUserId, adminRoleId);
    if (isAdmin) {
      return next();
    }

    const isUser = await Role.hasUserRole(authenticatedUserId, userRoleId);
    if (isUser && userId === authenticatedUserId) {
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
