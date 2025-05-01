import axios from 'axios';
import dotenv from 'dotenv';
import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
dotenv.config();


const router = Router();
const ASTRAL_URL = process.env.ASTRAL_URL;

//GET /users/
router.get('/', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${ASTRAL_URL}/users`, {
            headers: {
                Authorization: req.headers.authorization,
            },
        });

        res.status(200).json(response.data);
    } catch (err) {
        console.error('satellite: Failed to fetch users:', err.message);
        res.status(err.response?.status || 500).json({
            error: err.response?.data?.error || 'Failed to fetch users',
        });
    }
});

router.post('/password-reset', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${ASTRAL_URL}/users/password-reset`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });

        res.status(response.status).json(response.data);
    } catch (err) {
        console.error("satellite: Password reset failed:", err.message);
        res.status(err.response?.status || 500).json({
            error: err.response?.data?.error || 'Password reset failed',
        });
    }
});



// POST /users/login
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

// POST /users/logout
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

// POST /users/create
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

// PUT /users/update
router.put('/update',authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${ASTRAL_URL}/users/update`, req.body, {
            headers: {
                Authorization: req.headers.authorization || '',
                'Content-Type': 'application/json',
            },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res
            .status(error.response?.status || 500)
            .json(error.response?.data || { error: 'Update user failed' });
    }
});

export default router;
