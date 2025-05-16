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

function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

export async function generatePdf({ report, engagement }) {
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawWrappedText = (page, text, x, startY, size = 10, lineSpacing = 14, maxWidth = 80) => {
        const lines = wrapText(text, maxWidth);
        lines.forEach((line, i) => {
            page.drawText(line, {
                x,
                y: startY - i * lineSpacing,
                size,
                font,
                color: rgb(0.2, 0.2, 0.2),
            });
        });
    };

    const eraseText = (page, x, y, width = 450, height = 20) => {
        page.drawRectangle({
            x,
            y: y - height + 5,
            width,
            height,
            color: rgb(1, 1, 1),
        });
    };

    // Page 1: Cover Page
    eraseText(pages[0], 150, 680);
    drawWrappedText(pages[0], engagement.customerName || "", 150, 680, 12, 14, 50);
    eraseText(pages[0], 150, 660);
    drawWrappedText(pages[0], report.title || "", 150, 660, 12, 14, 50);
    eraseText(pages[0], 150, 640);
    drawWrappedText(pages[0], `${engagement.startDate} - ${engagement.endDate}`, 150, 640, 12, 14, 50);

    // Page 4: Executive Summary
    eraseText(pages[3], 50, 700);
    drawWrappedText(pages[3], report.executiveSummary || "", 50, 700);

    // Page 5: Scope
    eraseText(pages[4], 50, 700);
    drawWrappedText(pages[4], engagement.description || "", 50, 700);

    // Page 6: Methodology
    eraseText(pages[5], 50, 700);
    drawWrappedText(pages[5], report.methodology || "", 50, 700);

    // Page 7: Engagement Timeline
    eraseText(pages[6], 50, 700);
    const timelineText = `Start Date: ${engagement.startDate}\nEnd Date: ${engagement.endDate || "N/A"}`;
    drawWrappedText(pages[6], timelineText, 50, 700);

    // Page 8: Tools and Techniques
    eraseText(pages[7], 50, 700);
    drawWrappedText(pages[7], report.toolsAndTechniques || "", 50, 700);

    // Page 9: Findings and Analysis
    let findingsY = 700;
    const findings = (report.sections || []).filter(s => s.type === "finding");
    for (const finding of findings) {
        const line = `${finding.data.title} (${finding.data.severity}): ${finding.data.description}`;
        drawWrappedText(pages[8], line, 50, findingsY);
        findingsY -= (wrapText(line, 80).length + 1) * 14;
    }

    // Page 10: Risk Ratings
    eraseText(pages[9], 50, 700);
    drawWrappedText(pages[9], "Risk ratings auto-calculated based on severity and context.", 50, 700);

    // Page 11: Recommendations
    let recY = 700;
    for (const finding of findings) {
        if (finding.data.recommendation) {
            drawWrappedText(pages[10], finding.data.recommendation, 50, recY);
            recY -= (wrapText(finding.data.recommendation, 80).length + 1) * 14;
        }
    }

    // Page 12: Conclusion
    eraseText(pages[11], 50, 700);
    drawWrappedText(pages[11], report.conclusion || "", 50, 700);

    // Page 13: Contact Info
    eraseText(pages[12], 150, 680);
    drawWrappedText(pages[12], engagement.organization || "", 150, 680);
    eraseText(pages[12], 150, 660);
    drawWrappedText(pages[12], engagement.contactName || "", 150, 660);
    eraseText(pages[12], 150, 640);
    drawWrappedText(pages[12], engagement.contactEmail || "", 150, 640);
    eraseText(pages[12], 150, 620);
    drawWrappedText(pages[12], engagement.contactPhone || "", 150, 620);
    eraseText(pages[12], 150, 600);
    drawWrappedText(pages[12], engagement.contactAddress || "", 150, 600);

    const filename = `${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filepath, pdfBytes);

    return filename;
}
