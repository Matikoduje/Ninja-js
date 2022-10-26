import Joi from 'joi';

export class StatusCodeError extends Error {
  statusCode: number | undefined;
}
