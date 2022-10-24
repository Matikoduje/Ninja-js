import { readFileSync } from 'fs';
import { Request, Response } from 'express';
import { version } from '../../package.json';

const getCommitHash = (): string => {
  const rev = readFileSync('.git/HEAD').toString().trim();
  if (rev.indexOf(':') === -1) {
    return rev;
  } else {
    return readFileSync('.git/' + rev.substring(5))
      .toString()
      .trim();
  }
};

const getVersionController = async (req: Request, res: Response) => {
  const commitHash: string = getCommitHash();

  res.status(200).json({
    commitHash,
    version: version === undefined ? 'Version cannot be loaded!' : version
  });
};

export default getVersionController;
