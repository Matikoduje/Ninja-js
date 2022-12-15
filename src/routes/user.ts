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
  validateUserIdFromParams,
  validateUserEtag
} from '../middleware/user-middleware';
import {
  validationMiddleware,
  validationUpdateMiddleware
} from '../middleware/validation-middleware';
import {
  isUserAuthenticated,
  isUserAuthorized
} from '../middleware/auth-middleware';
import { updateUserJSONPatchValidation } from '../middleware/json-patch-middleware';

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
  validateUserEtag,
  deleteUser
);

router.patch(
  '/users/:userId',
  isUserAuthenticated,
  isUserAuthorized,
  validateUserIdFromParams,
  updateUserJSONPatchValidation,
  validateUserEtag,
  validationUpdateMiddleware(userValidationSchemas.update),
  updateUser
);

export default router;
