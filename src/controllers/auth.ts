import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodeError, appErrorHandler } from '../handlers/custom-errors';
import {
  generateAccessToken,
  generateRefreshToken
} from '../handlers/json-web-tokens';
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
      throw new StatusCodeError(
        'Invalid credentials. Invalid email or password.',
        401
      );
    }
    const isPasswordMatch = await bcrypt.compare(password, user.getPassword());
    if (!isPasswordMatch) {
      throw new StatusCodeError(
        'Invalid credentials. Invalid email or password.',
        401
      );
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: 'Successfully login into site.',
      refreshToken,
      accessToken
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
