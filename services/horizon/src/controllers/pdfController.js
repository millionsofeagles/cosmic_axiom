import { generatePdf } from "../services/pdfGenerator.js"; // You'll implement this

export const generatePdfReport = async (req, res) => {
    const { report, engagement } = req.body;

    if (!report || !engagement) {
        return res.status(400).json({ error: "Missing report, engagement, or sections data" });
    }

    try {
        // Step 1: Generate the PDF using provided data
        const filePath = await generatePdf({ report, engagement });

        // Step 2: Return the path to the generated file
        res.status(200).json({ url: `/generated/${filePath}` });
    } catch (err) {
        console.error("Failed to generate PDF:", err.message);
        res.status(500).json({ error: "PDF generation failed" });
    }
};
