import { Router } from 'express';
import { verifyToken } from '../utils/tokenUtils.js';

const router = Router();

router.post('/verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    const payload = await verifyToken(token); // includes revoked/expired logic

    if (!payload) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
    res.json(payload); // includes { sub, role, email, etc }
});

export default router;
