import { Router } from 'express';
import { generatePdfReport, generateBriefingReport, deleteFile } from '../controllers/pdfController.js';
import healthRoutes from './health.js';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = Router();

router.use('/health', healthRoutes);
router.post('/generate', generatePdfReport);
router.post('/generate-briefing', generateBriefingReport);
router.delete('/files/:filename', authenticateRequest, deleteFile);

export default router;