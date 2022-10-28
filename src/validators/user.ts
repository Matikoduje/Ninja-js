import Joi from 'joi';
import User from '../models/user';
import { StatusCodeError } from '../helpers/custom-errors';

const isUsernameUsed = async (username: string) => {
  const isUnique = await User.isUsernameUnique(username);
  if (!isUnique) {
    throw new StatusCodeError(
      'Username is already in used. Please provide other username.',
      409
    );
  }
};

const usernameValidationMessages = {
  'string.empty': 'Username cannot be an empty field.',
  'any.required': 'username is a required field.',
  'string.email': 'Username should be a valid email address.'
};
const passwordValidationMessages = {
  'string.empty': 'Password cannot be an empty field.',
  'string.min': `Password should have a minimum length of {#limit}`,
  'any.required': 'password is a required field.',
  'string.max': `Password shouldn't be longer than {#limit}`
};
const confirmPasswordMessages = {
  'any.required': 'confirm_password is a required field.',
  'any.only': 'Confirm password does not match password.'
};

const usernameValidation = Joi.string()
  .email()
  .messages(usernameValidationMessages);

const passwordValidation = Joi.string()
  .min(6)
  .max(30)
  .messages(passwordValidationMessages);
const confirmPasswordValidation = Joi.any()
  .equal(Joi.ref('password'))
  .messages(confirmPasswordMessages);

const userValidationSchemas = {
  accountCreation: Joi.object({
    password: passwordValidation.required(),
    confirm_password: confirmPasswordValidation.required(),
    username: usernameValidation.required().external(isUsernameUsed)
  }),
  authentication: Joi.object({
    username: usernameValidation.required(),
    password: passwordValidation.required()
  }),
  update: Joi.object({
    // username: usernameValidation,
    username: usernameValidation.external(isUsernameUsed),
    password: passwordValidation,
    confirm_password: confirmPasswordValidation
  })
};

export default userValidationSchemas;
