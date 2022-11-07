import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { appErrorHandler, StatusCodeError } from '../handlers/error-handler';
import User from '../models/user';
import { applyPatch, Operation } from 'fast-json-patch';
import {
  isUpdateOperation,
  UpdateOperation
} from '../handlers/patch-user-handler';

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.getUsers();
    res.status(200).json({ message: 'Users', users });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;
  const userId = user.getId();

  try {
    if (!userId) {
      throw new StatusCodeError('User Not Found', 404);
    }
    const ETag = await user.generateETag();
    res
      .status(200)
      .set('ETag', ETag.toString())
      .json({
        user: {
          id: user.getId(),
          username: user.getUsername(),
          created_at: user.getCreatedAt(),
          active: user.getUserStatus()
        }
      });
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
  const patch = req.body;

  try {
    const preparedPatchWithHashedPassword = await Promise.all(
      patch.map(async (operation: UpdateOperation) => {
        if (operation.path !== '/password') {
          return operation;
        }
        if (operation.path === '/password') {
          const modifiedOperation = { ...operation };
          const isPasswordMatch = await bcrypt.compare(
            operation.value,
            user.getPassword()
          );
          if (isPasswordMatch) {
            throw new StatusCodeError(
              'You cannot change the password to the same one you already have.',
              422
            );
          }
          if (!isPasswordMatch) {
            const hashedPassword = await bcrypt.hash(operation.value, 12);
            modifiedOperation.value = hashedPassword;
            return modifiedOperation;
          } else {
            return;
          }
        }
      })
    );
    const filteredPatch = preparedPatchWithHashedPassword.filter(
      (element) => element !== undefined
    );
    applyPatch(user, filteredPatch);
    user.save();
    res.status(200).json({
      message: `User data was changed. Current token for user was deleted. Please login again into account.`
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
    if (user.isDeleted()) {
      throw new StatusCodeError('User is deleted already.', 409);
    }
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
