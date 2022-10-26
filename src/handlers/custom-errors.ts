import { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import { ValidationError } from 'joi';

export class StatusCodeError extends Error {
  statusCode: number | undefined;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const appErrorHandler = (err: any) => {
  if (err instanceof StatusCodeError) {
    return err;
  }

  let errorMessage = '';
  if (err instanceof ValidationError) {
    errorMessage = err.details.map((detail) => detail.message).join('. ');
    return new StatusCodeError(errorMessage, 422);
  } else {
    errorMessage = err instanceof Error ? err.message : 'DB connection error.';
    return new StatusCodeError(errorMessage, 500);
  }
};

export const appErrorRequestHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const { message } = err;
  const errorOutput = {
    message
  };
  res.status(statusCode).json(errorOutput);
};
