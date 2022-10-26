import Joi from 'joi';
import User from '../models/user';
import { StatusCodeError } from '../handlers/custom-errors';

const isUsernameUsed = async (username: string) => {
  const user = await User.loadUser(username);
  if (user) {
    throw new StatusCodeError(
      'Username is already in used. Please provide other username.',
      409
    );
  }
};

const usernameValidation = Joi.string().required().email().messages({
  'string.empty': 'Username cannot be an empty field.',
  'any.required': 'username is a required field.',
  'string.email': 'Username should be a valid email address.'
});
const passwordValidation = Joi.string().min(6).max(30).required().messages({
  'string.empty': 'Password cannot be an empty field.',
  'any.required': 'password is a required field.',
  'string.min': `Password should have a minimum length of {#limit}`,
  'string.max': `Password shouldn't be longer than {#limit}`
});

const userValidationSchemas = {
  accountCreation: Joi.object({
    password: passwordValidation,
    confirm_password: Joi.any().equal(Joi.ref('password')).required().messages({
      'any.required': 'confirm_password is a required field.',
      'any.only': 'Confirm password does not match password.'
    }),
    username: usernameValidation.external(isUsernameUsed)
  }),
  authentication: Joi.object({
    username: usernameValidation,
    password: passwordValidation
  })
};

export default userValidationSchemas;
