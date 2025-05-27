import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const prisma = new PrismaClient();

// GET /reports/default-template
router.get("/default-template", authenticateRequest, async (req, res) => {
    try {
        const template = await prisma.defaultReportTemplate.findUnique({
            where: { id: "singleton" }
        });

        if (!template) {
            return res.status(404).json({ error: "Default report template not found" });
        }

        res.json(template);
    } catch (err) {
        console.error("Failed to fetch default template:", err.message);
        res.status(500).json({ error: "Failed to fetch default report template" });
    }
});

// PUT /reports/default-template
router.put("/default-template", authenticateRequest, async (req, res) => {
    const { executiveSummary, methodology, toolsAndTechniques, conclusion } = req.body;

    try {
        const updated = await prisma.defaultReportTemplate.upsert({
            where: { id: "singleton" },
            update: {
                executiveSummary,
                methodology,
                toolsAndTechniques,
                conclusion
            },
            create: {
                id: "singleton",
                executiveSummary,
                methodology,
                toolsAndTechniques,
                conclusion
            }
        });

        res.json(updated);
    } catch (err) {
        console.error("Failed to update default template:", err.message);
        res.status(500).json({ error: "Failed to update default report template" });
    }
});

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
    const { filename } = req.body;

    if (!filename) {
        return res.status(400).json({ error: "Missing filename in request body" });
    }

    try {
        const updatedReport = await prisma.report.update({
            where: { id },
            data: { filename },
        });

        res.json(updatedReport);
    } catch (err) {
        console.error("Failed to update report filename:", err.message);
        res.status(500).json({ error: "Failed to update report filename" });
    }
});

// PUT /reports/:id - Update title and optional narrative fields
router.put("/:id", authenticateRequest, async (req, res) => {
    const { id } = req.params;
    const {
        title,
        executiveSummary,
        methodology,
        toolsAndTechniques,
        conclusion
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (executiveSummary !== undefined) data.executiveSummary = executiveSummary;
    if (methodology !== undefined) data.methodology = methodology;
    if (toolsAndTechniques !== undefined) data.toolsAndTechniques = toolsAndTechniques;
    if (conclusion !== undefined) data.conclusion = conclusion;

    try {
        const updated = await prisma.report.update({
            where: { id },
            data
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
            orderBy: { createdAt: "desc" },
        });

        res.json(reports);
    } catch (err) {
        console.error("Failed to fetch reports:", err.message);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

// GET /reports/:id - fetch a specific report by report ID and include sections and engagementId
router.get('/:id', authenticateRequest, async (req, res, next) => {
    try {
        const { id } = req.params;

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                sections: {
                    orderBy: { position: 'asc' },
                    include: {
                        reportFinding: true
                    }
                }
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

// DELETE /reports/:id - Delete a report and its associated PDF
router.delete('/:id', authenticateRequest, async (req, res) => {
    const { id } = req.params;
    
    try {
        // First, get the report to check if it has a PDF file
        const report = await prisma.report.findUnique({
            where: { id }
        });
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        // Delete all associated sections and findings
        await prisma.section.deleteMany({
            where: { reportId: id }
        });
        
        await prisma.reportFinding.deleteMany({
            where: { reportId: id }
        });
        
        // Delete the report
        await prisma.report.delete({
            where: { id }
        });
        
        // If report had a PDF file, notify Horizon to delete it
        if (report.filename && process.env.HORIZON_URL) {
            try {
                await axios.delete(
                    `${process.env.HORIZON_URL}/files/${report.filename}`,
                    {
                        headers: { Authorization: req.headers.authorization }
                    }
                );
            } catch (err) {
                console.error('Failed to delete PDF file:', err.message);
                // Continue even if file deletion fails
            }
        }
        
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Failed to delete report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

export default router;
