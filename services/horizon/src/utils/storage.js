import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const GENERATED_DIR = path.resolve("generated");

// Ensure the directory exists
if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

/**
 * Saves a buffer or string to a unique file in the `generated` directory.
 * @param {Buffer|string} content - The file contents.
 * @param {string} extension - File extension (e.g., 'pdf', 'pptx').
 * @returns {string} The full file path.
 */
export function saveGeneratedFile(content, extension) {
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(GENERATED_DIR, filename);

    fs.writeFileSync(filepath, content);
    return filepath;
}

/**
 * Get the public-accessible URL for a generated file.
 * @param {string} filename - The name of the file in `generated/`.
 * @returns {string} URL to access the file.
 */
export function getFileUrl(filename) {
    return `/generated/${filename}`;
}

/**
 * Clean up old files, if needed (e.g., files older than X hours).
 * You can call this on a schedule.
 */
export function cleanOldFiles(maxAgeHours = 24) {
    const now = Date.now();
    const files = fs.readdirSync(GENERATED_DIR);
    
    for (const file of files) {
        const filePath = path.join(GENERATED_DIR, file);
        const stats = fs.statSync(filePath);
        const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

        if (ageHours > maxAgeHours) {
            fs.unlinkSync(filePath);
        }
    }
}

export async function saveReportFile(filePath, buffer) {
    // Example local file system save
    const fullPath = path.resolve('storage', filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return filePath;
}

