import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { appErrorHandler, StatusCodeError } from '../helpers/custom-errors';
import User from '../models/user';
import { applyPatch, Operation } from 'fast-json-patch';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.getUsers();
    res.status(200).json({ message: 'Active users list.', users });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const preparedUser = new User(username, hashedPassword);
    await preparedUser.save();
    res
      .status(201)
      .json({ message: 'User created! You can login into site now.' });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const { username, password } = req.body;
  const patch = [];

  try {
    if (typeof username === 'string') {
      const usernamePatch = {
        op: 'replace',
        path: '/username',
        value: username
      } as Operation;
      patch.push(usernamePatch);
    }

    if (typeof password === 'string') {
      const isPasswordMatch = await bcrypt.compare(
        password,
        user.getPassword()
      );
      if (!isPasswordMatch) {
        const hashedPassword = await bcrypt.hash(password, 12);
        const passwordPatch = {
          op: 'replace',
          path: '/password',
          value: hashedPassword
        } as Operation;
        patch.push(passwordPatch);
      }
    }

    if (patch.length === 0) {
      return res.status(200).json({
        message: `The entered data is identical to the existing user or data was lack. User remains unchanged.`
      });
    }
    applyPatch(user, patch);
    user.save();
    res.status(200).json({
      message: `User data was changed. Current session for user was closed. Please login again into account.`
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;

  try {
    const updatedUser = await user.delete();
    const updatedUsername = updatedUser.getUsername();
    if (!updatedUser.isDeleted()) {
      throw new StatusCodeError("'User can't be deleted.", 409);
    }
    res.status(200).json({
      message: `Successfully deleted user with username: ${updatedUsername}`
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
