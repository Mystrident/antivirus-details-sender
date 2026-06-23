import { logger } from "../../logger.js";
import fs from "fs";
import path from "path";
import type { McAfeeMetrics } from "../../types/antivirus.js";
import { sortFilesByMtime } from "../../utils/file-io.js";
import { extractTimestampFromContent } from "../../utils/data-extraction.js";
import {
  WINDOWS_PATHS,
  FILE_PATTERNS,
  EXTRACTION_PATTERNS,
} from "../../config/constants.js";

function isRecentlyModified(file: string): boolean {
  const stats = fs.statSync(file);
  return Date.now() - stats.mtimeMs < 5 * 60 * 1000; // 5 min
}

async function getSortedEtlFiles(): Promise<string[]> {
  const files = await sortFilesByMtime(
    WINDOWS_PATHS.MCAFEE_LOG,
    FILE_PATTERNS.ETL_FILES,
  );

  const etlFiles = files.filter((f) =>
    path.basename(f).startsWith(FILE_PATTERNS.MCAFEE_ETL_PREFIX),
  );

  // Skip newest file because McAfee may still be writing to it
  return etlFiles.slice(1);
}

function getMcAfeeLastScan(files: string[]): string | null {
  for (const file of files) {
    try {
      if (isRecentlyModified(file)) {
        continue;
      }

      const content = fs.readFileSync(file, "utf8");

      const scanDate = extractTimestampFromContent(
        content,
        EXTRACTION_PATTERNS.MCAFEE_SCAN_TIMESTAMP,
      );

      if (scanDate) {
        logger.debug({ scanDate, file }, "McAfee last scan found");
        return scanDate;
      }
    } catch (err) {
      logger.warn({ file }, "Skipping unreadable McAfee ETL");
    }
  }

  return null;
}

function getMcAfeeExpiryDate(files: string[]): string | null {
  for (const file of files) {
    try {
      if (isRecentlyModified(file)) {
        continue;
      }

      const content = fs.readFileSync(file, "utf8");
      const expiryDate = extractTimestampFromContent(
        content,
        EXTRACTION_PATTERNS.MCAFEE_EXPIRY_TIME,
      );

      if (expiryDate) {
        logger.debug({ expiryDate, file }, "McAfee expiry date found");
        return expiryDate;
      }
    } catch (err) {
      logger.warn({ file }, "Skipping unreadable McAfee ETL");
    }
  }

  return null;
}

export async function getMcAfeeMetrics(): Promise<McAfeeMetrics> {
  try {
    const files = await getSortedEtlFiles();
    return {
      lastScan: getMcAfeeLastScan(files),
      expiryDate: getMcAfeeExpiryDate(files),
    };
  } catch (error) {
    logger.error({ err: error }, "Failed retrieving McAfee metrics");
    return {
      lastScan: null,
      expiryDate: null,
    };
  }
}
