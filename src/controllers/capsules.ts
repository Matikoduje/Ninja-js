import { NextFunction, Request, Response } from 'express';
import { appErrorHandler } from '../handlers/error-handler';
import config from 'config';
import Capsule, { CapsuleData } from '../models/capsule';
import User from '../models/user';
import RequestHandler from '../handlers/request-handler';
import { applyPatch } from 'fast-json-patch';

const getCapsulesURL: string = config.get('App.capsulesGetRoute');

export const fetchDataFromAPI = async () => {
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
    const etag = await Capsule.getEtag(capsuleId);
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
  const capsuleData: CapsuleData = req.body;
  const { authenticatedUserId } = req;

  try {
    const user = await User.loadUserById(authenticatedUserId);
    const username = user.getUsername();
    const data = JSON.stringify(capsuleData);
    const capsule = await Capsule.save(data, username);
    res.status(201).json({ message: 'New capsule created!', capsule });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const deleteCapsule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const capsuleId = RequestHandler.getCapsuleIdFromParams(req);

  try {
    await Capsule.delete(capsuleId);
    res.status(200).json({
      message: `Successfully delete capsule. Deleted capsule Id: ${capsuleId}`
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};

export const updateCapsule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const capsuleId = RequestHandler.getCapsuleIdFromParams(req);

  try {
    const patch = req.body;
    const capsule = await Capsule.getCapsuleById(capsuleId);
    applyPatch(capsule, patch);
    await Capsule.update(capsuleId, capsule.data);
    res.status(200).json({
      message: 'Capsule data was changed.'
    });
  } catch (err) {
    const error = appErrorHandler(err);
    next(error);
  }
};
