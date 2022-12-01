import { Request, Response, NextFunction } from 'express';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import { getEtagFromSyncHeader } from '../middleware/validation-middleware';
import Capsule from '../models/capsule';

const getSync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('dadad');
    const etag = getEtagFromSyncHeader(req);
    const maxXmin = await Capsule.getCapsulesMaxXmin();
    if (!maxXmin) {
      throw new StatusCodeError('Capsules table is empty. No data found.', 404);
    }
    if (etag === maxXmin) {
      throw new StatusCodeError('Capsules does not require update.', 304);
    }
    const capsules = await Capsule.syncCapsules(etag);
    res.status(200).json({ etag: maxXmin, capsules });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export default getSync;
