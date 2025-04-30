import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Router } from 'express';
import { authenticateRequest } from '../middleware/authenticateRequest.js';
import { decodeToken, generateToken } from '../utils/tokenUtils.js';

const prisma = new PrismaClient();
const router = Router();

// POST /users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        const decoded = decodeToken(token);

        // Optional: store token for tracking
        await prisma.token.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(decoded.exp * 1000),
            },
        });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /users/logout
router.post('/logout', authenticateRequest, async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    try {
        await prisma.token.update({
            where: { token },
            data: { revokedAt: new Date() },
        });
        res.json({ message: 'Logged out' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// POST /users/create
router.post('/create', authenticateRequest, async (req, res) => {
    const { email, name, password, role } = req.body;

    try {
        if (req.tokenPayload.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'User already exists' });

        const passwordHash = bcrypt.hashSync(password, 10);
        const user = await prisma.user.create({
            data: { email, name, passwordHash, role },
        });

        res.status(201).json({ message: 'User created', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'User creation failed' });
    }
});

// GET /users/me
router.get('/me', authenticateRequest, async (req, res) => {
    const userId = req.tokenPayload.sub;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
});


export default router;
