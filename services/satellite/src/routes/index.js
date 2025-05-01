import { Router } from 'express';
import healthRoutes from './health.js';
import userRoutes from './users.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;