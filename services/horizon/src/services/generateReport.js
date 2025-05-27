import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { v4 as uuidv4 } from "uuid";

const templatePath = path.resolve("templates/report.html");
const outputDir = path.resolve("generated");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Handlebars helpers
Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
        case "===": return v1 === v2 ? options.fn(this) : options.inverse(this);
        case "!==": return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case ">": return v1 > v2 ? options.fn(this) : options.inverse(this);
        case "<": return v1 < v2 ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
    }
});

Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

Handlebars.registerHelper("toLowerCase", function (str) {
    return str ? str.toLowerCase() : '';
});

Handlebars.registerHelper("formatDate", function (date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

Handlebars.registerHelper("add", function(a, b) {
    return a + b;
});

const generateChartImage = async (severityCounts) => {
    const width = 600;
    const height = 400;
    const chartNodeCanvas = new ChartJSNodeCanvas({ 
        width, 
        height,
        backgroundColour: 'white'
    });

    const configuration = {
        type: "bar",
        data: {
            labels: ["Critical", "High", "Medium", "Low"],
            datasets: [{
                label: "Number of Findings",
                data: [
                    severityCounts.Critical || 0,
                    severityCounts.High || 0,
                    severityCounts.Medium || 0,
                    severityCounts.Low || 0,
                ],
                backgroundColor: ["#dc2626", "#ea580c", "#f59e0b", "#3b82f6"],
                borderColor: ["#991b1b", "#c2410c", "#d97706", "#2563eb"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Vulnerability Severity Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: '#e5e7eb'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    return await chartNodeCanvas.renderToDataURL(configuration);
};

export async function generatePdf({ report, engagement, existingFilename = null }) {
    const html = fs.readFileSync(templatePath, "utf8");
    const template = Handlebars.compile(html);

    // Ensure engagement has customerName field
    if (!engagement.customerName && engagement.customer) {
        engagement.customerName = engagement.customer;
    }
    
    // Ensure engagement has type field
    if (!engagement.type) {
        engagement.type = engagement.engagementType || 'Penetration Test';
    }

    // Process sections - ensure all have uppercase type
    if (report.sections) {
        report.sections = report.sections.map(s => ({
            ...s,
            type: s.type ? s.type.toUpperCase() : s.type
        }));
    }
    
    // Process findings
    const findings = (report.sections || [])
        .filter(s => s.type === "FINDING" && s.reportFinding)
        .map(s => {
            // Ensure finding has all required fields
            const finding = s.reportFinding;
            return {
                ...finding,
                category: finding.category || 'General',
                status: finding.status || 'Open',
                references: finding.reference ? [finding.reference] : []
            };
        });
    
    // Check if report has connectivity sections
    const hasConnectivity = (report.sections || []).some(s => s.type === "CONNECTIVITY");

    // Count severities
    const severityCounts = {
        Critical: findings.filter(f => f.severity === "CRITICAL").length,
        High: findings.filter(f => f.severity === "HIGH").length,
        Medium: findings.filter(f => f.severity === "MEDIUM").length,
        Low: findings.filter(f => f.severity === "LOW").length,
    };
    
    // Count informational (connectivity sections)
    const informationalCount = (report.sections || []).filter(s => s.type === "CONNECTIVITY").length;

    // Add additional report data
    report.chartImage = await generateChartImage(severityCounts);
    report.findings = findings;
    report.criticalCount = severityCounts.Critical;
    report.highCount = severityCounts.High;
    report.mediumCount = severityCounts.Medium;
    report.lowCount = severityCounts.Low;
    report.informationalCount = informationalCount;
    report.hasConnectivity = hasConnectivity;
    report.version = report.version || '1.0';
    report.generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    report.year = new Date().getFullYear();
    
    // Format dates
    if (engagement.startDate) {
        engagement.startDate = new Date(engagement.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    if (engagement.endDate) {
        engagement.endDate = new Date(engagement.endDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    if (report.createdAt) {
        report.createdAt = new Date(report.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const content = template({ report, engagement });

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(content, { waitUntil: "networkidle0" });

    // Use existing filename if provided, otherwise generate new one
    const filename = existingFilename || `${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    // Delete old file if it exists (for overwriting)
    if (existingFilename && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }

    await page.pdf({
        path: filepath,
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
            <div style="font-size:10px;text-align:center;width:100%;padding:0 1cm;color:#666;">
                <span style="float:left;">${engagement.customerName || 'Confidential'}</span>
                <span style="float:right;">${report.classification || 'CONFIDENTIAL'}</span>
            </div>`,
        footerTemplate: `
            <div style="font-size:10px;text-align:center;width:100%;color:#666;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                <span style="margin-left:2em;">|</span>
                <span style="margin-left:2em;">Generated by Cosmic Axiom</span>
            </div>`,
        margin: { 
            top: "1.5cm", 
            bottom: "1.5cm",
            left: "1.5cm",
            right: "1.5cm"
        },
    });

    await browser.close();
    return filename;
}

export async function generateBriefingPdf({ report, engagement, existingFilename = null }) {
    const briefingTemplatePath = path.resolve("templates/briefing.html");
    const html = fs.readFileSync(briefingTemplatePath, "utf8");
    const template = Handlebars.compile(html);

    // Ensure engagement has customerName field
    if (!engagement.customerName && engagement.customer) {
        engagement.customerName = engagement.customer;
    }

    // Process findings
    const findings = (report.sections || [])
        .filter(s => s.type === "FINDING" && s.reportFinding)
        .map(s => s.reportFinding);

    // Filter findings by severity
    const criticalFindings = findings.filter(f => f.severity === "CRITICAL");
    const highFindings = findings.filter(f => f.severity === "HIGH");
    const mediumFindings = findings.filter(f => f.severity === "MEDIUM");
    const lowFindings = findings.filter(f => f.severity === "LOW");

    // Count severities
    const totalFindings = findings.length;
    const criticalCount = criticalFindings.length;
    const highCount = highFindings.length;
    const mediumCount = mediumFindings.length;
    const lowCount = lowFindings.length;

    // Calculate percentages
    const criticalPercent = totalFindings > 0 ? Math.round((criticalCount / totalFindings) * 100) : 0;
    const highPercent = totalFindings > 0 ? Math.round((highCount / totalFindings) * 100) : 0;
    const mediumPercent = totalFindings > 0 ? Math.round((mediumCount / totalFindings) * 100) : 0;
    const lowPercent = totalFindings > 0 ? Math.round((lowCount / totalFindings) * 100) : 0;

    // Get top categories
    const categoryCount = {};
    findings.forEach(f => {
        const cat = f.category || 'General';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

    // Extract immediate and short-term actions
    const immediateActions = [
        ...criticalFindings.slice(0, 3).map(f => `Address ${f.title}`),
        ...highFindings.slice(0, 2).map(f => `Remediate ${f.title}`)
    ].filter(Boolean);
    
    const shortTermActions = [
        ...highFindings.slice(2, 4).map(f => `Plan remediation for ${f.title}`),
        ...mediumFindings.slice(0, 3).map(f => `Consider fixing ${f.title}`)
    ].filter(Boolean);

    // Format dates
    if (engagement.startDate) {
        engagement.startDate = new Date(engagement.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    if (engagement.endDate) {
        engagement.endDate = new Date(engagement.endDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }


    const templateData = {
        title: report.title,
        engagement,
        sections: report.sections.filter(s => s.type === "EXECUTIVE_SUMMARY"),
        totalFindings,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        criticalPercent,
        highPercent,
        mediumPercent,
        lowPercent,
        criticalFindings,
        highFindings,
        topCategories,
        immediateActions,
        shortTermActions
    };

    const content = template(templateData);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(content, { waitUntil: "networkidle0" });

    // Use existing filename if provided, otherwise generate new one
    const filename = existingFilename || `briefing-${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    // Delete old file if it exists (for overwriting)
    if (existingFilename && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }

    await page.pdf({
        path: filepath,
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: { 
            top: "0.5in", 
            bottom: "0.5in",
            left: "0.5in",
            right: "0.5in"
        },
    });

    await browser.close();
    return filename;
}
