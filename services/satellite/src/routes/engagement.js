import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const FORGE_URL = process.env.FORGE_URL;
const SINGULARITY_URL = process.env.SINGULARITY_URL;

// GET /engagement - Enrich each engagement with a report flag
router.get("/", authenticateRequest, async (req, res) => {
    try {
        // 1. Fetch engagements from Forge
        const engagementRes = await axios.get(`${FORGE_URL}/engagement`, {
            headers: { Authorization: req.headers.authorization },
        });
        const engagements = engagementRes.data;

        // 2. Fetch full reports from Singularity
        const reportRes = await axios.get(`${SINGULARITY_URL}/reports`, {
            headers: { Authorization: req.headers.authorization },
        });
        const reports = reportRes.data;

        // 3. Build a Map of engagementId → report
        const reportMap = new Map();
        reports.forEach((report) => {
            reportMap.set(report.engagementId, report);
        });

        // 4. Enrich engagements with reportId if it exists
        const enriched = engagements.map((engagement) => {
            const report = reportMap.get(engagement.id);
            return {
                ...engagement,
                report: report ? { id: report.id } : null,
            };
        });


        res.json(enriched);
    } catch (err) {
        console.error("GET /engagement failed:", err.message);
        res.status(500).json({ error: "Failed to fetch enriched engagements" });
    }
});

// POST /engagement
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${FORGE_URL}/engagement`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (err) {
        console.error("POST /engagement failed:", err.message);
        res.status(500).json({ error: "Failed to create engagement" });
    }
});

// GET /engagement/:id
router.get("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${FORGE_URL}/engagement/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (err) {
        console.error(`GET /engagement/${req.params.id} failed:`, err.message);
        res.status(404).json({ error: "Engagement not found" });
    }
});

// PUT /engagements/:id
router.put("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${FORGE_URL}/engagement/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (err) {
        console.error(`PUT /engagement/${req.params.id} failed:`, err.message);
        res.status(500).json({ error: "Failed to update engagement" });
    }
});

// DELETE /engagement/:id
router.delete("/:id", authenticateRequest, async (req, res) => {
    try {
        // First, find and delete all reports associated with this engagement
        const reportsRes = await axios.get(`${SINGULARITY_URL}/reports?engagementId=${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        
        const reports = reportsRes.data;
        
        // Delete each report (which will cascade delete sections, findings, and images)
        for (const report of reports) {
            await axios.delete(`${SINGULARITY_URL}/reports/${report.id}`, {
                headers: { Authorization: req.headers.authorization },
            });
        }
        
        // Then delete the engagement (which will cascade delete scopes)
        await axios.delete(`${FORGE_URL}/engagement/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        
        res.json({ message: "Engagement and all associated data deleted successfully" });
    } catch (err) {
        console.error(`DELETE /engagement/${req.params.id} failed:`, err.message);
        res.status(500).json({ error: "Failed to delete engagement" });
    }
});

export default router;
