import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { appErrorHandler } from '../handlers/custom-errors';
import User from '../models/user';

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

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res
      .status(200)
      .json({ message: 'User created! You can login into site now.' });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
