import { Router } from 'express';
import getVersionController from '../controllers/ninja';

const router = Router();

router.get('/version', getVersionController);

export default router;
