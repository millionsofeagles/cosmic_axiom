import { Router } from 'express';
import healthRoutes from './health.js';
import reportsRoutes from './reports.js';
import sectionsRoutes from './sections.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/reports', reportsRoutes);
router.use('/sections', sectionsRoutes);

export default router;