import { Request } from 'express';

export class RequestHandler {
  static getUserIdFromParams(req: Request): number {
    return parseInt(req.params.userId as string);
  }
}
