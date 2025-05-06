import { Router } from 'express';
import customerRoutes from './customer.js';
import engagementRoutes from "./engagement.js";
import findingsRoutes from './findings.js';
import healthRoutes from './health.js';
import reportsRoutes from './reports.js';
import sectionsRoutes from './sections.js';
import userRoutes from './users.js';


const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/findings', findingsRoutes);
router.use('/customer', customerRoutes);
router.use("/engagement", engagementRoutes);
router.use('/sections', sectionsRoutes);
router.use('/reports', reportsRoutes);


export default router;