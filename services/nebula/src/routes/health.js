import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = Router();

router.get('/', authenticateRequest, (req, res) => {
    res.json({ 
        status: 'Nebula AI service healthy',
        service: 'nebula',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

export default router;