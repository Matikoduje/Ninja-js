import Joi from 'joi';
import User from '../models/user';

const isEmailUsed = async (email: string) => {
  const user = await User.loadUser(email);
  if (user) {
    throw new Error('Email is already in used. Please provide other email.');
  }
};

const emailValidation = Joi.string().required().email().messages({
  'string.empty': 'Email cannot be an empty field.',
  'any.required': 'email is a required field.',
  'string.email': 'Email should be a valid email address.'
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
    email: emailValidation.external(isEmailUsed)
  }),
  authentication: Joi.object({
    email: emailValidation,
    password: passwordValidation
  })
};

export default userValidationSchemas;
