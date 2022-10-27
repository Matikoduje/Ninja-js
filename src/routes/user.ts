import { Router } from 'express';
import { getUsers, addUser, deleteUser } from '../controllers/user';
import userValidationSchemas from '../validators/user';
import {
  validationMiddleware,
  validateUserIdFromParams
} from '../middleware/validation-middleware';
import {
  isUserAuthenticated,
  isUserTokenValid,
  isUserAuthorized
} from '../middleware/auth-middleware';

const router = Router();

router.get('/users', getUsers);
router.post(
  '/users',
  validationMiddleware(userValidationSchemas.accountCreation),
  addUser
);
router.delete(
  '/users/:userId',
  isUserAuthenticated,
  isUserTokenValid,
  isUserAuthorized,
  validateUserIdFromParams,
  deleteUser
);

export default router;
