import { Router } from 'express';
import getSync from '../controllers/sync';

const router = Router();

router.get('/sync', getSync);

export default router;
