import { Router } from 'express';
import { login, logout } from '../controllers/auth';
import userValidationSchemas from '../validators/user';
import validationMiddleware from '../middleware/validation-middleware';
import {
  isUserAuthenticated,
  isUserTokenValid
} from '../middleware/auth-middleware';

const router = Router();

router.post(
  '/auth',
  validationMiddleware(userValidationSchemas.authentication),
  login
);

router.get('/logout', isUserAuthenticated, isUserTokenValid, logout);

export default router;
