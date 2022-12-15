import { Request, Response, NextFunction } from 'express';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import {
  isUpdateOperation,
  setUpdateUserParam,
  verifyUpdatePasswordMatches,
  verifyUpdateUserRoles
} from '../handlers/patch-handler';

export const updateUserJSONPatchValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let updateParams = {};
  try {
    req.body.forEach((element: any, index: any, iteratedArray: any) => {
      if (!isUpdateOperation('User', element)) {
        throw new StatusCodeError(
          'Patch request body is not set correctly.',
          400
        );
      }
      updateParams = setUpdateUserParam(updateParams, element);
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

export const updateCapsuleJSONPatchValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.forEach((element: any) => {
      if (!isUpdateOperation('Capsule', element)) {
        throw new StatusCodeError(
          'Patch request body is not set correctly.',
          400
        );
      }
    });
    next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};
