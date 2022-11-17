import { Router } from 'express';
import { getCapsules } from '../controllers/capsules';

const router = Router();

router.get('/capsules', getCapsules);

export default router;
