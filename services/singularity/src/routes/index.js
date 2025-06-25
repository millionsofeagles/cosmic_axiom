import { Router } from 'express';
import healthRoutes from './health.js';
import reportsRoutes from './reports.js';
import sectionsRoutes from './sections.js';
import imagesRoutes from './images.js';
import roeRoutes from './roe.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/reports', reportsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/images', imagesRoutes);
router.use('/roe', roeRoutes);

export default router;