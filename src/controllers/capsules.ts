import { NextFunction, Request, Response } from 'express';
import { appErrorHandler } from '../handlers/error-handler';
import config from 'config';
import Capsule, { CapsuleData } from '../models/capsule';
import RequestHandler from '../handlers/request-handler';

const getCapsulesURL: string = config.get('App.capsulesGetRoute');

const fetchDataFromAPI = async () => {
  const response = await fetch(getCapsulesURL, {
    method: 'GET'
  });
  const fetchedData = await response.json();
  const fetchedCapsules = fetchedData.map((fetchedElement: CapsuleData) => {
    return Array(JSON.stringify(fetchedElement));
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
    const capsules = await Capsule.getCapsules();
    res.status(200).json({ capsules });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const getCapsule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const capsuleId = RequestHandler.getCapsuleIdFromParams(req);

    const capsule = await Capsule.getCapsuleById(capsuleId);
    const etag = await Capsule.getEtag(capsule.id);
    res.status(200).set('ETag', etag).json({
      capsule
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const addCapsule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
  // try {
  //   console.log(req.body);
  //   const capsule = await Capsule.getCapsuleById();
  //   const etag = await Capsule.getEtag(capsule.id);
  //   res.status(200).set('ETag', etag).json({
  //     capsule
  //   });
  // } catch (err) {
  //   const error = appErrorHandler(err);
  //   next(error);
  // }
};
