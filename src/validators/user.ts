import Joi from 'joi';
import User from '../models/user';

const isEmailUsed = async (email: string) => {
  const isEmailUsed = await User.isEmailExists(email);
  if (isEmailUsed) {
    throw new Error('Email is already in used.');
  }
};

const emailValidation = Joi.string().email();
const passwordValidation = Joi.string().min(6).max(30);

const userValidationSchemas = {
  accountCreation: Joi.object({
    password: passwordValidation,
    confirm_password: Joi.ref('password'),
    email: emailValidation.external(isEmailUsed)
  }),
  authentication: Joi.object({
    email: emailValidation,
    password: passwordValidation
  })
};

export default userValidationSchemas;
