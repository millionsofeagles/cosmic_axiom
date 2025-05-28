import { Router } from 'express';
import healthRoutes from './health.js';
import aiRoutes from './ai.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/ai', aiRoutes);

export default router;