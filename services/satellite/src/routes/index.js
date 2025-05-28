import { Router } from 'express';
import customerRoutes from './customer.js';
import engagementRoutes from "./engagement.js";
import findingsRoutes from './findings.js';
import healthRoutes from './health.js';
import reportsRoutes from './reports.js';
import sectionsRoutes from './sections.js';
import userRoutes from './users.js';
import threatIntelRoutes from "./threatintel.js";
import cveRoutes from './cve.js';
import testApiRoutes from './test-api.js';
import newsRoutes from './news.js';
import scopeRoutes from './scope.js';
import imagesRoutes from './images.js';
import aiRoutes from './ai.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/findings', findingsRoutes);
router.use('/customer', customerRoutes);
router.use("/engagement", engagementRoutes);
router.use('/sections', sectionsRoutes);
router.use('/reports', reportsRoutes);
router.use("/threatintel", threatIntelRoutes);
router.use('/cve', cveRoutes);
router.use('/test-api', testApiRoutes);
router.use('/news', newsRoutes);
router.use('/scope', scopeRoutes);
router.use('/images', imagesRoutes);
router.use('/ai', aiRoutes);



export default router;