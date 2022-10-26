import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from 'config';

const refreshTokenSecret: string = config.get('App.refreshTokenSecret');
const accessTokenSecret: string = config.get('App.accessTokenSecret');

export const generateAccessToken = (user: User) => {
  return jwt.sign(
    {
      email: user.getEmail(),
      id: user.getId()
    },
    accessTokenSecret,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: User) => {
  return jwt.sign(
    {
      email: user.getEmail(),
      id: user.getId()
    },
    refreshTokenSecret,
    { expiresIn: '20m' }
  );
};
