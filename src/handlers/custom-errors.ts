import Joi from 'joi';

export class StatusCodeError extends Error {
  statusCode: number | undefined;
}

export class StatusCodeValidationError extends StatusCodeError {
  validationError: string | undefined;
}
