import { Router } from 'express';
import findingsRoutes from './findings.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/findings', findingsRoutes);

export default router;