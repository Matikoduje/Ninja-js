import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodeError, appErrorHandler } from '../handlers/error-handler';
import generateAccessToken from '../helpers/jswt-generate';
import User from '../models/user';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const user = await User.loadUser(username);
    if (!user) {
      throw new StatusCodeError(
        'Invalid credentials. Invalid username or password.',
        401
      );
    }
    const isPasswordMatch = await bcrypt.compare(password, user.getPassword());
    if (!isPasswordMatch) {
      throw new StatusCodeError(
        'Invalid credentials. Invalid username or password.',
        401
      );
    }
    if (user.isDeleted()) {
      throw new StatusCodeError(
        "Your account is deleted. You can't login into site.",
        401
      );
    }
    const accessToken = generateAccessToken(user);
    user.saveAuthenticationToken(accessToken);

    res.status(200).json({
      message:
        'Successfully login into site. Please save access token. You must set this token in authorization header to authorize actions in site. Format: Bearer AccessTokenValue',
      accessToken,
      id: user.getId()
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
