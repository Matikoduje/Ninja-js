import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodeError, appErrorHandler } from '../handlers/custom-errors';
import User from '../models/user';

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const user = await User.loadUser(email);
    if (!user) {
      throw new StatusCodeError("Invalid credentials. User doesn't exist", 401);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.getPassword());
    if (!isPasswordMatch) {
      throw new StatusCodeError("Invalid credentials. User doesn't exist", 401);
    }
    res.status(200).json({ message: 'Active users list.' });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
