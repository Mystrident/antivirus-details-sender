import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../logger.js';
export async function sortFilesByMtime(dir, extension) {
    try {
        return fs
            .readdirSync(dir)
            .filter((f) => f.toLowerCase().endsWith(extension))
            .map((f) => ({
            path: path.join(dir, f),
            mtime: fs.statSync(path.join(dir, f)).mtimeMs,
        }))
            .sort((a, b) => b.mtime - a.mtime)
            .map((f) => f.path);
    }
    catch (error) {
        logger.debug({ err: error }, `Failed to scan directory: ${dir}`);
        return [];
    }
}
export function createTempFilePath(prefix, extension) {
    return path.join(os.tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
}
export async function cleanupTempFile(filePath) {
    try {
        fs.unlinkSync(filePath);
    }
    catch (error) {
        logger.debug({ err: error }, `Failed to cleanup temp file: ${filePath}`);
    }
}
export async function readTempCopiedFile(sourceFile, prefix, extension) {
    const tempFile = createTempFilePath(prefix, extension);
    try {
        fs.copyFileSync(sourceFile, tempFile);
    }
    catch (error) {
        logger.error({ err: error }, `Failed to copy file from ${sourceFile} to ${tempFile}`);
        return null;
    }
    try {
        const content = fs.readFileSync(tempFile, 'utf8');
        return content;
    }
    catch (error) {
        logger.error({ err: error }, `Failed to read temp file: ${tempFile}`);
        return null;
    }
    finally {
        await cleanupTempFile(tempFile);
    }
}
