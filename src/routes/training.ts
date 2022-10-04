import { Router } from 'express';
import getVersionController from '../controllers/training';

const router = Router();

router.get('/version', getVersionController);

export default router;
