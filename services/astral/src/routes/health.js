import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = Router();

router.get('/', authenticateRequest, (req, res) => {
    res.json({ status: 'Satellite BFF healthy' });
});

export default router;
