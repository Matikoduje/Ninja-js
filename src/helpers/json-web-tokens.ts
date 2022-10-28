import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from 'config';

const accessTokenSecret: string = config.get(
  'App.jsonWebTokensConfiguration.accessTokenSecret'
);

const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      username: user.getUsername(),
      id: user.getId()
    },
    accessTokenSecret,
    { expiresIn: '15m' }
  );
};

export default generateAccessToken;
