import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

const router = Router();
const prisma = new PrismaClient();

// POST /reports - Create a new report
router.post("/", authenticateRequest, async (req, res) => {
    const { engagementId, title } = req.body;

    if (!engagementId || !title) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const newReport = await prisma.report.create({
            data: { title, engagementId },
        });

        res.status(201).json(newReport);
    } catch (err) {
        console.error("Failed to create report:", err.message);
        res.status(500).json({ error: "Failed to create report" });
    }
});

// PATCH /reports/:id/filename - Update the report's PDF filename
router.patch("/:id/filename", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const { reportId, filename } = req.body;

    if (!filename) {
        return res.status(400).json({ error: "Missing filename in request body" });
    }

    try {
        const updatedReport = await prisma.report.update({
            where: { id: reportId, engagementId: id },
            data: { filename },
        });

        res.json(updatedReport);
    } catch (err) {
        console.error("Failed to update report filename:", err.message);
        res.status(500).json({ error: "Failed to update report filename" });
    }
});

// PUT /reports/:id - Update title (user-controlled)
router.put("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    try {
        const updated = await prisma.report.update({
            where: { id },
            data: { title },
        });

        res.json(updated);
    } catch (err) {
        console.error("Failed to update report:", err.message);
        res.status(500).json({ error: "Failed to update report" });
    }
});

// GET /reports - Get all reports
router.get("/", authenticateRequest, async (req, res) => {
    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: "desc" }, // Optional: newest first
        });

        res.json(reports);
    } catch (err) {
        console.error("Failed to fetch reports:", err.message);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});


// GET /reports/:id - fetch a specific report by engagementID
router.get('/:engagementId', authenticateRequest, async (req, res, next) => {
    try {
        const { engagementId } = req.params;

        const report = await prisma.report.findFirst({
            where: { engagementId },
            include: {
                sections: {
                    orderBy: { position: 'asc' },
                },
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    } catch (error) {
        next(error);
    }
});


export default router;
