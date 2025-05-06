import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const router = Router();
const prisma = new PrismaClient();

// POST /sections - Create and assign to report
router.post("/", authenticateRequest, async (req, res) => {
    const { reportId, type, data, position } = req.body;

    if (!reportId || !type || !data) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newSection = await prisma.section.create({
            data: {
                reportId,
                type,
                data,
                position
            },
        });

        res.status(201).json(newSection);
    } catch (err) {
        console.error("Failed to create section:", err.message);
        res.status(500).json({ error: "Failed to create section" });
    }
});

// PUT /sections/:id - Update section data and completion status
router.put("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const { data, isComplete } = req.body;

    try {
        const updated = await prisma.section.update({
            where: { id },
            data: {
                data,
                isComplete,
            },
        });

        // Check if all sections on the same report are complete
        const section = await prisma.section.findUnique({ where: { id } });
        const reportId = section.reportId;

        const incompleteCount = await prisma.section.count({
            where: {
                reportId,
                isComplete: false,
            },
        });

        if (incompleteCount === 0) {
            await prisma.report.update({
                where: { id: reportId },
                data: { status: "COMPLETED" },
            });
        }

        res.json(updated);
    } catch (err) {
        console.error("Failed to update section:", err.message);
        res.status(500).json({ error: "Failed to update section" });
    }
});

// GET /reports/:id/sections - Get all sections for a report
router.get('/:reportId', authenticateRequest, async (req, res) => {
    const { reportId } = req.params;

    try {
        const sections = await prisma.section.findMany({
            where: { reportId: reportId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                data: true,
                createdAt: true,
                updatedAt: true,
                position: true,
            },
        });

        res.json(sections);
    } catch (err) {
        console.error(`Failed to get sections for report ${reportId}:`, err.message);
        res.status(500).json({ error: 'Failed to fetch sections for report' });
    }
});

export default router;
