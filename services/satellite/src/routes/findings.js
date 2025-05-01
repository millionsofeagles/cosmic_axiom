import axios from 'axios';
import express from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';

const router = express.Router();
const LIBRARY_URL = process.env.LIBRARY_URL || 'http://localhost:5003'; // adjust as needed

// GET /api/findings — List all findings
router.get('/', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${LIBRARY_URL}/findings`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error('satellite: GET /findings failed:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch findings' });
    }
});

// GET /api/findings/:id — Get a specific finding
router.get('/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${LIBRARY_URL}/findings/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error('satellite: GET /findings/:id failed:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to fetch finding' });
    }
});

// POST /api/findings — Create new finding
router.post('/', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${LIBRARY_URL}/findings`, req.body, {
            headers: {
                Authorization: req.headers.authorization,
                'Content-Type': 'application/json',
            }
        });
        res.status(201).json(response.data);
    } catch (err) {
        console.error('satellite: POST /findings failed:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to create finding' });
    }
});

// POST /api/findings/update — Update a finding
router.post('/update', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${LIBRARY_URL}/findings/update`, req.body, {
            headers: {
                Authorization: req.headers.authorization,
                'Content-Type': 'application/json',
            }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error('satellite: POST /findings/update failed:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to update finding' });
    }
});

// DELETE /api/findings/:id — Delete finding
router.delete('/:id', authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${LIBRARY_URL}/findings/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(200).json(response.data);
    } catch (err) {
        console.error('satellite: DELETE /findings/:id failed:', err.message);
        res.status(err.response?.status || 500).json({ error: 'Failed to delete finding' });
    }
});

export default router;
