import { Request, Response, NextFunction } from 'express';
import Capsule from '../models/capsule';
import RequestHandler from '../handlers/request-handler';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import { getEtagFromHeader } from './validation-middleware';

export const validateCapsuleIdFromParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const capsuleId = RequestHandler.getCapsuleIdFromParams(req);
  try {
    const isCapsuleExists = Capsule.isValidCapsuleId(capsuleId);
    if (!isCapsuleExists) {
      throw new StatusCodeError('Capsule not found', 404);
    }
    return next();
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const validateCapsuleEtag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let etag;

  try {
    etag = getEtagFromHeader(req);
    const capsuleId = RequestHandler.getCapsuleIdFromParams(req);
    const isValidEtag = await Capsule.verifyEtag(capsuleId, etag);
    if (!isValidEtag) {
      throw new StatusCodeError(
        'The attached Etag does not reflect the current state of the capsule. The action will not be performed.',
        412
      );
    }
    next();
  } catch (err) {
    const error = appErrorHandler(err);
    return next(error);
  }
};
