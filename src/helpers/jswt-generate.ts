import jwt from 'jsonwebtoken';
import User from '../models/user';
import config from 'config';

const accessTokenSecret: string = config.get(
  'App.jsonWebTokensConfiguration.accessTokenSecret'
);

const expiresIn: string = config.get(
  'App.jsonWebTokensConfiguration.expiresIn'
);

const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      username: user.getUsername(),
      id: user.getId()
    },
    accessTokenSecret,
    { expiresIn }
  );
};

export default generateAccessToken;
