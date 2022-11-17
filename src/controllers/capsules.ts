import { NextFunction, Request, Response } from 'express';
import { appErrorHandler } from '../handlers/error-handler';
import config from 'config';
import Capsule, { CapsuleData } from '../models/capsule';

const getCapsulesURL: string = config.get('App.capsulesGetRoute');

const fetchDataFromAPI = async () => {
  const response = await fetch(getCapsulesURL, {
    method: 'GET'
  });
  const fetchedData = await response.json();
  const fetchedCapsules = fetchedData.map((fetchedElement: CapsuleData) => {
    return {
      source: 'spacexAPI',
      data: fetchedElement
    };
  });
  await Capsule.fetchCapsulesFromAPI(fetchedCapsules);
};

export const getCapsules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const areCapsulesFetched = await Capsule.areCapsulesFetchFromAPI();
    if (!areCapsulesFetched) {
      await fetchDataFromAPI();
    }
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
