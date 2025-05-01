import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ASTRAL_URL = process.env.ASTRAL_URL;

export async function authenticateRequest(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const response = await axios.post(`${ASTRAL_URL}/token/verify`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        req.tokenPayload = response.data;
        next();
    } catch (err) {
        const status = err.response?.status || 403;
        res.status(status).json({ error: 'Invalid or expired token' });
    }
}
