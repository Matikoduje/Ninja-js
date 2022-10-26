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
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const preparedUser = new User(email, hashedPassword);
    const createdUserId = await preparedUser.save();
    res.status(201).json({ message: 'User created!', userId: createdUserId });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
