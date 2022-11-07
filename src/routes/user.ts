import { Router } from 'express';
import {
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  getUser
} from '../controllers/user';
import userValidationSchemas from '../validators/user';
import {
  validationMiddleware,
  validationUpdateMiddleware,
  validateUserIdFromParams,
  validateETag,
  validateJSONPatchForUpdateUser
} from '../middleware/validation-middleware';
import {
  isUserAuthenticated,
  isUserAuthorized
} from '../middleware/auth-middleware';

const router = Router();

router.get(
  '/users/:userId',
  isUserAuthenticated,
  isUserAuthorized,
  validateUserIdFromParams,
  getUser
);
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
  validateETag,
  deleteUser
);

router.patch(
  '/users/:userId',
  isUserAuthenticated,
  isUserAuthorized,
  validateUserIdFromParams,
  validateJSONPatchForUpdateUser,
  validateETag,
  validationUpdateMiddleware(userValidationSchemas.update),
  updateUser
);

export default router;
