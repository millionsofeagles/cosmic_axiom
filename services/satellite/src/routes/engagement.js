import axios from "axios";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

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

        // 3. Build a Set of engagementIds that have reports
        const reportMap = new Set(reports.map(r => r.engagementId));

        // 4. Enrich engagements with a report indicator
        const enriched = engagements.map((engagement) => ({
            ...engagement,
            report: reportMap.has(engagement.id) ? { id: true } : null,
        }));

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
        await axios.delete(`${FORGE_URL}/engagement/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json({ message: "Engagement deleted" });
    } catch (err) {
        console.error(`DELETE /engagement/${req.params.id} failed:`, err.message);
        res.status(500).json({ error: "Failed to delete engagement" });
    }
});

export default router;
