import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
dotenv.config();

const router = Router();
const prisma = new PrismaClient();
const ASTRAL_URL = process.env.ASTRAL_URL;

// GET /findings — list all findings
router.get('/', authenticateRequest, async (req, res) => {
    try {
        const findings = await prisma.findingTemplate.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(findings);
    } catch (err) {
        console.error('Failed to fetch findings:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /findings — create new finding
router.post('/', authenticateRequest, async (req, res) => {
    const { title, description, recommendation, severity, reference, tags } = req.body;

    if (!title || !description || !recommendation || !severity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const newFinding = await prisma.findingTemplate.create({
            data: {
                title,
                description,
                recommendation,
                severity,
                reference,
                tags: tags || [],
            }
        });
        res.status(201).json(newFinding);
    } catch (err) {
        console.error('Failed to create finding:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /findings/update — update existing finding
router.post('/update', authenticateRequest, async (req, res) => {
    const { id, title, description, recommendation, severity, reference, tags } = req.body;

    if (!id || !title || !description || !recommendation || !severity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const updated = await prisma.findingTemplate.update({
            where: { id },
            data: {
                title,
                description,
                recommendation,
                severity,
                reference,
                tags: tags || [],
            }
        });
        res.json(updated);
    } catch (err) {
        console.error('Failed to update finding:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /findings/:id — delete finding
router.delete('/:id', authenticateRequest, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.findingTemplate.delete({ where: { id } });
        res.json({ message: 'Finding deleted' });
    } catch (err) {
        console.error('Failed to delete finding:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
