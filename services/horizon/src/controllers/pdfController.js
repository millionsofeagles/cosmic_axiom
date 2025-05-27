import { generatePdf, generateBriefingPdf } from "../services/generateReport.js";
import fs from "fs";
import path from "path";

export const generatePdfReport = async (req, res) => {
    const { report, engagement, existingFilename } = req.body;

    if (!report || !engagement) {
        return res.status(400).json({ error: "Missing report, engagement, or sections data" });
    }

    try {
        // Step 1: Generate the PDF using provided data
        const filePath = await generatePdf({ report, engagement, existingFilename });

        // Step 2: Return the path to the generated file
        res.status(200).json({ url: `/generated/${filePath}` });
    } catch (err) {
        console.error("Failed to generate PDF:", err.message);
        res.status(500).json({ error: "PDF generation failed" });
    }
};

export const generateBriefingReport = async (req, res) => {
    const { report, engagement, existingFilename } = req.body;

    if (!report || !engagement) {
        return res.status(400).json({ error: "Missing report or engagement data" });
    }

    try {
        // Generate the briefing PDF using provided data
        const filePath = await generateBriefingPdf({ report, engagement, existingFilename });

        // Return the path to the generated file
        res.status(200).json({ url: `/generated/${filePath}` });
    } catch (err) {
        console.error("Failed to generate briefing PDF:", err.message);
        res.status(500).json({ error: "Briefing PDF generation failed" });
    }
};

export const deleteFile = async (req, res) => {
    const { filename } = req.params;
    
    if (!filename || !filename.endsWith('.pdf')) {
        return res.status(400).json({ error: "Invalid filename" });
    }
    
    try {
        const outputDir = path.resolve("generated");
        const filepath = path.join(outputDir, filename);
        
        // Check if file exists and delete it
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.json({ message: "File deleted successfully" });
        } else {
            res.status(404).json({ error: "File not found" });
        }
    } catch (err) {
        console.error("Failed to delete file:", err.message);
        res.status(500).json({ error: "File deletion failed" });
    }
};
