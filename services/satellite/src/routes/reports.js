import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import { authenticateRequest } from "../middleware/authenticateRequest.js";

dotenv.config();

const router = express.Router();
const SINGULARITY_URL = process.env.SINGULARITY_URL;
const FORGE_URL = process.env.FORGE_URL;
const HORIZON_URL = process.env.HORIZON_URL;

// GET /reports/default-template
router.get("/default-template", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.get(`${SINGULARITY_URL}/reports/default-template`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (err) {
        console.error("Satellite BFF failed to fetch default template:", err.message);
        res.status(500).json({ error: "Failed to fetch default report template" });
    }
});

// PUT /reports/default-template
router.put("/default-template", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/reports/default-template`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.json(response.data);
    } catch (err) {
        console.error("Satellite BFF failed to update default template:", err.message);
        res.status(500).json({ error: "Failed to update default report template" });
    }
});

// GET latest generated PDF for report
router.get("/pdf/:filename", authenticateRequest, async (req, res) => {
    const { filename } = req.params;
    const token = req.headers.authorization;

    try {
        const pdfResponse = await axios.get(`${HORIZON_URL}/generated/${filename}`, {
            responseType: "stream",
            headers: { Authorization: token }
        });

        // Set content headers for PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

        // Pipe PDF stream directly to the client
        pdfResponse.data.pipe(res);
    } catch (err) {
        console.error("Failed to stream PDF from Horizon:", err.message);
        res.status(500).json({ error: "Unable to stream PDF." });
    }
});

// Placeholder for future PowerPoint endpoint
router.get("/ppt/:reportId", async (req, res) => {
    // You can fill this out when the PowerPoint generation service is ready
    res.status(501).json({ message: "PowerPoint download not implemented yet" });
});

// POST /reports/:reportId/generate-pdf
router.post("/:reportId/generate-pdf", async (req, res) => {
    const { reportId } = req.params;
    const token = req.headers.authorization;
    
    if (!reportId) {
        return res.status(400).json({ error: "Missing reportId" });
    }

    try {
        // Fetch report from Singularity
        const reportRes = await axios.get(`${process.env.SINGULARITY_URL}/reports/${reportId}`, {
            headers: { Authorization: token },
        });
        const report = reportRes.data;
        // Fetch engagement from Forge
        const engagementRes = await axios.get(`${process.env.FORGE_URL}/engagement/${report.engagementId}`, {
            headers: { Authorization: token },
        });
        const engagement = engagementRes.data;
        
        // Fetch scopes for the engagement from Forge
        let scopes = [];
        try {
            const scopesRes = await axios.get(`${process.env.FORGE_URL}/scope/engagement/${report.engagementId}`, {
                headers: { Authorization: token },
            });
            scopes = scopesRes.data;
        } catch (err) {
            console.log("No scopes found for engagement:", err.message);
        }
        
        // Add scopes to engagement object
        engagement.scopes = scopes;
        
        // Send to Horizon to generate the PDF, passing existing filename if available
        const horizonRes = await axios.post(
            `${process.env.HORIZON_URL}/generate`,
            { 
                report, 
                engagement,
                existingFilename: report.filename || null 
            },
            {
                headers: { Authorization: token },
            }
        );

        const filename = horizonRes.data.url.split("/").pop();
        
        // Only update filename in database if it's a new file
        if (!report.filename) {
            const store_response = await axios.patch(
                `${SINGULARITY_URL}/reports/${reportId}/filename`,
                { filename, reportId: reportId },
                { headers: { Authorization: token } }
            );
        }

        res.status(200).json(horizonRes.data); // should include { url: "/generated/filename.pdf" }
    } catch (err) {
        console.error("Error in BFF /generate-pdf:", err.message);
        res.status(500).json({ error: "Failed to generate report PDF" });
    }
});

// GET /reports - Get all reports enriched with engagement data
router.get("/", authenticateRequest, async (req, res) => {
    try {
        console.log("GET /reports - URLs:", { SINGULARITY_URL, FORGE_URL });
        
        // 1. Fetch reports from Singularity
        console.log("Fetching reports from Singularity...");
        let reports;
        try {
            const reportsRes = await axios.get(`${SINGULARITY_URL}/reports`, {
                headers: { Authorization: req.headers.authorization },
            });
            reports = reportsRes.data;
            console.log(`Got ${reports.length} reports from Singularity`);
        } catch (err) {
            console.error("Failed to fetch from Singularity:", err.message);
            throw err;
        }

        // 2. Fetch engagements from Forge
        console.log("Fetching engagements from Forge...");
        let engagements;
        try {
            const engagementsRes = await axios.get(`${FORGE_URL}/engagement`, {
                headers: { Authorization: req.headers.authorization },
            });
            engagements = engagementsRes.data;
            console.log(`Got ${engagements.length} engagements from Forge`);
        } catch (err) {
            console.error("Failed to fetch from Forge:", err.message);
            throw err;
        }

        // 3. Map engagementId → engagement details
        const engagementMap = {};
        for (const eng of engagements) {
            engagementMap[eng.id] = eng;
        }

        // 4. Enrich each report
        const enriched = reports.map((report) => ({
            ...report,
            engagement: engagementMap[report.engagementId] || null,
        }));

        res.json(enriched);
    } catch (err) {
        console.error("GET /reports failed:", err.message);
        console.error("Full error:", err.response?.data || err);
        res.status(500).json({ error: "Failed to fetch enriched reports" });
    }
});

// GET /reports/:reportId - Fetch report by engagement ID
router.get("/:reportId", authenticateRequest, async (req, res) => {
    const reportId = req.params.reportId;

    if (!reportId) {
        res.status(404).json({ error: "Engagement Id Missing" });
    }
    try {
        // 1. Get report from Singularity by engagementId
        const reportRes = await axios.get(`${SINGULARITY_URL}/reports/${reportId}`, {
            headers: { Authorization: req.headers.authorization },
        });


        const report = reportRes.data;

        // 2. Get engagement info from Astral (includes customer, etc.)
        const engagementRes = await axios.get(`${FORGE_URL}/engagement/${report.engagementId}`, {
            headers: { Authorization: req.headers.authorization },
        });

        const engagement = engagementRes.data;

        // 3. Return enriched report
        res.json({
            ...report,
            engagement,
        });

    } catch (error) {
        console.error("Error enriching report:", error.message);
        res.status(500).json({ error: "Failed to fetch and enrich report" });
    }
});

// GET /reports/:id/sections - Fetch sections for a specific report
router.get('/:id/sections', authenticateRequest, async (req, res) => {
    try {

        const response = await axios.get(`${SINGULARITY_URL}/sections/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching report sections:", error.message);
        res.status(500).json({ error: "Failed to fetch report sections" })
    }
});

// POST /reports - Create a new report
router.post("/", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.post(`${SINGULARITY_URL}/reports`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(201).json(response.data);
    } catch (error) {
        console.error("Error creating report:", error.message);
        res.status(500).json({ error: "Failed to create report" });
    }
});

// PUT /reports/:id - Update report title
router.put("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.put(`${SINGULARITY_URL}/reports/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error updating report:", error.message);
        res.status(500).json({ error: "Failed to update report" });
    }
});

// POST /reports/:reportId/generate-briefing
router.post("/:reportId/generate-briefing", authenticateRequest, async (req, res) => {
    const { reportId } = req.params;
    const token = req.headers.authorization;
    
    if (!reportId) {
        return res.status(400).json({ error: "Missing reportId" });
    }

    try {
        // Fetch report from Singularity
        const reportRes = await axios.get(`${SINGULARITY_URL}/reports/${reportId}`, {
            headers: { Authorization: token },
        });
        const report = reportRes.data;
        
        // Fetch engagement from Forge
        const engagementRes = await axios.get(`${FORGE_URL}/engagement/${report.engagementId}`, {
            headers: { Authorization: token },
        });
        const engagement = engagementRes.data;
        
        // Send to Horizon to generate the briefing PDF
        const horizonRes = await axios.post(
            `${HORIZON_URL}/generate-briefing`,
            { report, engagement },
            {
                headers: { Authorization: token },
            }
        );

        res.status(200).json(horizonRes.data);
    } catch (err) {
        console.error("Error in BFF /generate-briefing:", err.message);
        res.status(500).json({ error: "Failed to generate briefing PDF" });
    }
});

// DELETE /reports/:id - Delete a report
router.delete("/:id", authenticateRequest, async (req, res) => {
    try {
        const response = await axios.delete(`${SINGULARITY_URL}/reports/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error deleting report:", error.message);
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.error || "Failed to delete report" 
        });
    }
});

export default router;
