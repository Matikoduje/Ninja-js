import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodeError } from '../handlers/custom-errors';
import config from 'config';

const accessTokenSecret: string = config.get('App.accessTokenSecret');

export const verifyToken = (
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
  req.userId = id;

  next();
};
