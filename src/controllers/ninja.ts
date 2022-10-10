import childProcess from 'child_process';
import { Request, Response } from 'express';
import { version } from '../../package.json';

const getCommitHash = (): string => {
  return childProcess.execSync('git rev-parse HEAD').toString().trim();
};

const getVersionController = async (req: Request, res: Response) => {
  const commitHash: string = getCommitHash();

  res.status(200).json({
    commitHash,
    version: version === undefined ? 'Version cannot be loaded!' : version
  });
};

export default getVersionController;
