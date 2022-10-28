import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodeError, appErrorHandler } from '../helpers/custom-errors';
import generateAccessToken from '../helpers/json-web-tokens';
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
    user.setAuthenticationToken(accessToken);

    res.status(200).json({
      message:
        'Successfully login into site. Please save access token. You should use this token in header authorization to authorize actions in site.',
      accessToken,
      id: user.getId()
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authenticatedUserId } = req;
  try {
    const isUserLogout = await User.userLogout(authenticatedUserId);
    if (!isUserLogout) {
      throw new StatusCodeError('Provided token is not valid.', 401);
    }
    res.status(200).json({
      message: 'You have logged out of the site. Please come back!'
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
