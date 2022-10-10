import childProcess from 'child_process';
import { Request, Response } from 'express';

const getCommitHash = (): string => {
  return childProcess.execSync('git rev-parse HEAD').toString().trim();
};

const getVersionController = async (req: Request, res: Response) => {
  const commitHash: string = getCommitHash();
  const version: string | undefined = process.env.npm_package_version;

  res.status(200).json({
    commitHash,
    version: version === undefined ? 'Version cannot be loaded!' : version
  });
};

export default getVersionController;
