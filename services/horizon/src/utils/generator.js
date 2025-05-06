import PDFDocument from 'pdfkit';

export const generatePdfBuffer = async (reportId) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(20).text(`Report for ID: ${reportId}`);
        doc.text("This is a placeholder for actual content.");

        doc.end();
    });
};
