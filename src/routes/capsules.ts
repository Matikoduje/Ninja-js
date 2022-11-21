import { Router } from 'express';
import { getCapsules, getCapsule, addCapsule } from '../controllers/capsules';
import validationMiddleware from '../middleware/validation-middleware';
import capsuleValidationSchemas from '../validators/capsule';

const router = Router();

router.get('/capsules/:capsuleId', getCapsule);
router.get('/capsules', getCapsules);
router.post(
  '/capsules',
  validationMiddleware(capsuleValidationSchemas.capsuleCreation),
  addCapsule
);

export default router;
