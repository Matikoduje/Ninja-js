import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import query from '../db/database';
import { StatusCodeError } from '../handlers/custom-errors';
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
    const errorMessage = err instanceof Error ? err.message : 'Internal error.';
    const error = new StatusCodeError(errorMessage);
    error.statusCode = 500;
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
    const errorMessage = err instanceof Error ? err.message : 'Internal error.';
    const error = new StatusCodeError(errorMessage);
    error.statusCode = 500;
    next(error);
  }
};
