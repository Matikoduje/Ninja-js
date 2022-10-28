import { Router } from 'express';
import { getUsers, addUser, deleteUser, updateUser } from '../controllers/user';
import userValidationSchemas from '../validators/user';
import {
  validationMiddleware,
  validateUserIdFromParams
} from '../middleware/validation-middleware';
import {
  isUserAuthenticated,
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
  isUserAuthorized,
  validateUserIdFromParams,
  deleteUser
);
router.patch(
  '/users/:userId',
  isUserAuthenticated,
  isUserAuthorized,
  validateUserIdFromParams,
  validationMiddleware(userValidationSchemas.update),
  updateUser
);

export default router;
