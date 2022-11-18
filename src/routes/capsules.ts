import { Router } from 'express';
import { getCapsules, getCapsule } from '../controllers/capsules';

const router = Router();

router.get('/capsules/:capsuleId', getCapsule);
router.get('/capsules', getCapsules);

export default router;
