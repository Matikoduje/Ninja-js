import { Router } from 'express';
import { login } from '../controllers/auth';
import userValidationSchemas from '../validators/user';
import validationMiddleware from '../middleware/validation-middleware';

const router = Router();

router.post(
  '/auth',
  validationMiddleware(userValidationSchemas.authentication),
  login
);

export default router;
