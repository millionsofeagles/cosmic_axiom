import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const NEBULA_URL = process.env.NEBULA_URL || "http://localhost:3007";
const SINGULARITY_URL = process.env.SINGULARITY_URL;
const FORGE_URL = process.env.FORGE_URL;
const LIBRARY_URL = process.env.LIBRARY_URL;

// POST /ai/generate/:reportId - Generate AI content for a report section
router.post("/generate/:reportId", authenticateRequest, async (req, res) => {
    const { reportId } = req.params;
    const { prompt, sectionType } = req.body;
    const token = req.headers.authorization;

    if (!prompt || !sectionType) {
        return res.status(400).json({ error: "Missing prompt or sectionType" });
    }

    try {
        console.log(`Gathering context data for AI generation - Report: ${reportId}, Section: ${sectionType}`);

        // 1. Fetch report data from Singularity
        const reportRes = await axios.get(`${SINGULARITY_URL}/reports/${reportId}`, {
            headers: { Authorization: token },
        });
        const reportData = reportRes.data;

        // 2. Fetch engagement data from Forge
        const engagementRes = await axios.get(`${FORGE_URL}/engagement/${reportData.engagementId}`, {
            headers: { Authorization: token },
        });
        const engagementData = engagementRes.data;

        // 3. Fetch customer data from Forge
        const customerRes = await axios.get(`${FORGE_URL}/customer`, {
            headers: { Authorization: token },
        });
        const customers = customerRes.data;
        const customerData = customers.find(c => c.id === engagementData.customerId);

        // 4. Fetch findings data from report sections
        const sectionsRes = await axios.get(`${SINGULARITY_URL}/sections/${reportId}`, {
            headers: { Authorization: token },
        });
        const sections = sectionsRes.data;
        const findingsData = sections.filter(s => s.reportFinding).map(s => s.reportFinding);

        // 5. Fetch scope data from Forge
        let scopeData = [];
        try {
            const scopeRes = await axios.get(`${FORGE_URL}/scope/engagement/${engagementData.id}`, {
                headers: { Authorization: token },
            });
            scopeData = scopeRes.data;
        } catch (err) {
            console.log("No scope data found for engagement");
        }

        // 6. Send all context data to Nebula AI service
        // Use section-specific endpoint if available, otherwise fall back to generic
        const sectionEndpoints = {
            executive: '/ai/generate/executive',
            methodology: '/ai/generate/methodology',
            tools: '/ai/generate/tools',
            conclusion: '/ai/generate/conclusion'
        };
        
        const endpoint = sectionEndpoints[sectionType] || '/ai/generate';
        
        const aiRes = await axios.post(`${NEBULA_URL}${endpoint}`, {
            prompt,
            sectionType,
            reportData,
            engagementData,
            customerData,
            findingsData,
            scopeData
        }, {
            headers: { Authorization: token },
        });

        console.log(`AI content generated successfully for ${sectionType}`);
        res.json(aiRes.data);

    } catch (error) {
        console.error("AI generation failed:", error.message);
        res.status(500).json({ error: "Failed to generate AI content" });
    }
});

export default router;