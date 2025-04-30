import axios from 'axios';
import dotenv from 'dotenv';
import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
dotenv.config();


const router = Router();
const ASTRAL_URL = process.env.ASTRAL_URL;

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const response = await axios.post(`${ASTRAL_URL}/users/login`, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res
            .status(error.response?.status || 500)
            .json(error.response?.data || { error: 'Login failed' });
    }
});

// POST /api/users/logout
router.post('/logout', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${ASTRAL_URL}/users/logout`, req.body, {
            headers: {
                Authorization: req.headers.authorization || '',
                'Content-Type': 'application/json',
            },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res
            .status(error.response?.status || 500)
            .json(error.response?.data || { error: 'Logout failed' });
    }
});

// POST /api/users/create
router.post('/create',authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${ASTRAL_URL}/users/create`, req.body, {
            headers: {
                Authorization: req.headers.authorization || '',
                'Content-Type': 'application/json',
            },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res
            .status(error.response?.status || 500)
            .json(error.response?.data || { error: 'Create user failed' });
    }
});

export default router;
