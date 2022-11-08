import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import User from '../models/user';
import RequestHandler from '../handlers/request-handler';
import {
  isUpdateOperation,
  setUpdateParam,
  verifyUpdatePasswordMatches,
  verifyUpdateUserRoles
} from '../handlers/patch-user-handler';

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

export const validateJSONPatchForUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let updateParams = {};
  try {
    req.body.forEach((element: any, index: any, iteratedArray: any) => {
      if (!isUpdateOperation(element)) {
        throw new StatusCodeError(
          'Patch request body is not set correctly.',
          400
        );
      }
      updateParams = setUpdateParam(updateParams, element);
      if (element.path === '/confirm_password') {
        iteratedArray.splice(index, 1);
      }
      if (element.path === '/roles') {
        if (!Array.isArray(element.value)) {
          throw new StatusCodeError(
            'If you want to change user roles. You should provide value for path \roles as array.',
            400
          );
        }
        verifyUpdateUserRoles(element.value);
      }
    });
    if (!verifyUpdatePasswordMatches(updateParams)) {
      throw new StatusCodeError(
        'If you want to change password you must set the same values in /password and /confirm_password.',
        422
      );
    }
    req.updateParams = updateParams;
    next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
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

export const validateETag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let etag;

  try {
    if (req.headers['if-match']) {
      etag = req.headers['if-match'];
    }
    if (!etag) {
      throw new StatusCodeError(
        'A required header if-match is missing. In if-match header you should set etag value.',
        400
      );
    }

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

export default validationMiddleware;
