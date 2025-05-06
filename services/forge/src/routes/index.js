import { Router } from 'express';
import customerRoutes from './customer.js';
import engagementRoutes from './engagement.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/customer', customerRoutes);
router.use('/engagement', engagementRoutes);

export default router;