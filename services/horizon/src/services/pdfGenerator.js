import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "..", "..", "generated");
const templatePath = path.join(__dirname, "..", "..", "templates/report-template.pdf");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

export async function generatePdf({ report, engagement }) {
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawText = (page, text, x, y, size = 12) => {
        page.drawText(text, {
            x, y, size,
            font,
            color: rgb(0.2, 0.2, 0.2),
        });
    };

    // Page 1: Cover Page
    drawText(pages[0], engagement.customerName || "N/A", 150, 680);
    drawText(pages[0], report.title || "N/A", 150, 660);
    drawText(pages[0], engagement.startDate + " - " + engagement.endDate, 150, 640);

    // Page 4: Executive Summary
    drawText(pages[3], report.summary || "Executive summary not provided.", 50, 700, 10);

    // Page 5: Scope
    drawText(pages[4], report.scope || "Scope not defined.", 50, 700, 10);

    // Page 6: Methodology
    drawText(pages[5], report.methodology || "Methodology not provided.", 50, 700, 10);

    // Page 7: Engagement Timeline
    drawText(pages[6], engagement.timeline || "Timeline not specified.", 50, 700, 10);

    // Page 8: Tools and Techniques
    drawText(pages[7], report.tools || "Tools not listed.", 50, 700, 10);

    // Page 9: Findings and Analysis
    let findingsY = 700;
    (report.sections || []).filter(s => s.type === "finding").forEach(finding => {
        const text = `${finding.data.title} (${finding.data.severity}): ${finding.data.description}`;
        drawText(pages[8], text.slice(0, 100), 50, findingsY, 10); // truncate to 100 chars
        findingsY -= 40;
    });

    // Page 10: Risk Ratings
    drawText(pages[9], "Risk ratings auto-calculated.", 50, 700, 10);

    // Page 11: Recommendations
    let recY = 700;
    (report.sections || []).filter(s => s.data.recommendation).forEach(finding => {
        drawText(pages[10], finding.data.recommendation.slice(0, 100), 50, recY, 10);
        recY -= 40;
    });

    // Page 13: Contact Info
    drawText(pages[12], engagement.organization || "N/A", 150, 680);
    drawText(pages[12], engagement.contactName || "N/A", 150, 660);
    drawText(pages[12], engagement.contactEmail || "N/A", 150, 640);
    drawText(pages[12], engagement.contactPhone || "N/A", 150, 620);
    drawText(pages[12], engagement.contactAddress || "N/A", 150, 600);

    const filename = `${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filepath, pdfBytes);

    return filename;
}
