import { verifyToken } from '../utils/tokenUtils.js';

export function authenticateRequest(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    const payload = verifyToken(token);
    if (!payload) return res.status(403).json({ error: 'Invalid or expired token' });

    req.tokenPayload = payload;
    next();
}