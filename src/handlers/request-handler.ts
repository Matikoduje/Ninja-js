import { Request } from 'express';

class RequestHandler {
  static getUserIdFromParams(req: Request): number {
    return parseInt(req.params.userId as string);
  }
  static getCapsuleIdFromParams(req: Request): number {
    return parseInt(req.params.capsuleId as string);
  }
}

export default RequestHandler;
