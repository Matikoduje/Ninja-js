import { Router } from 'express';
import { getUsers, addUser, deleteUser } from '../controllers/user';
import userValidationSchemas from '../validators/user';
import validationMiddleware from '../middleware/validation-middleware';
import { verifyToken } from '../middleware/jwt-verification-middleware';

const router = Router();

router.get('/users', getUsers);
router.post(
  '/users',
  validationMiddleware(userValidationSchemas.accountCreation),
  addUser
);
router.delete('/users/:userId', verifyToken, deleteUser);

export default router;
