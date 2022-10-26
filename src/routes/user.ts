import { Router } from 'express';
import { getUsers, addUser } from '../controllers/user';
import userValidationSchemas from '../validators/user';
import validationMiddleware from '../middlewares/validation-middleware';

const router = Router();

router.get('/users', getUsers);
router.post(
  '/users',
  validationMiddleware(userValidationSchemas.accountCreation),
  addUser
);

export default router;
