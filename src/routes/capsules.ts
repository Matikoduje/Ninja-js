import { Router } from 'express';
import {
  getCapsules,
  getCapsule,
  addCapsule,
  deleteCapsule,
  updateCapsule
} from '../controllers/capsules';
import validationMiddleware from '../middleware/validation-middleware';
import capsuleValidationSchemas from '../validators/capsule';
import { isUserAuthenticated } from '../middleware/auth-middleware';
import {
  validateCapsuleIdFromParams,
  validateCapsuleEtag
} from '../middleware/capsule-middleware';
import { updateCapsuleJSONPatchValidation } from '../middleware/json-patch-middleware';

const router = Router();

router.get('/capsules/:capsuleId', validateCapsuleIdFromParams, getCapsule);
router.get('/capsules', getCapsules);
router.post(
  '/capsules',
  isUserAuthenticated,
  validationMiddleware(capsuleValidationSchemas.capsuleCreation),
  addCapsule
);
router.delete(
  '/capsules/:capsuleId',
  isUserAuthenticated,
  validateCapsuleIdFromParams,
  validateCapsuleEtag,
  deleteCapsule
);
router.patch(
  '/capsules/:capsuleId',
  isUserAuthenticated,
  validateCapsuleIdFromParams,
  updateCapsuleJSONPatchValidation,
  validateCapsuleEtag,
  updateCapsule
);

export default router;
