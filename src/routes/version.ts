import { Router } from 'express';
import getVersionController from '../controllers/version';

const router = Router();

router.get('/version', getVersionController);

export default router;
