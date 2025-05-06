import { Router } from 'express';
import { generatePdfReport } from '../controllers/pdfController.js';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);
router.post('/generate', generatePdfReport);

export default router;