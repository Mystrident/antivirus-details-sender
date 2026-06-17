console.log("mcafee db");

import fs from "fs";
import path from "path";

export interface McAfeeMetrics {
  lastScan: string | null;
  expiryDate: string | null;
}

function getSortedEtlFiles(): string[] {
  const logDir = "C:\\ProgramData\\McAfee\\wps\\log";

  try {
    return fs
      .readdirSync(logDir)
      .filter((f) => f.startsWith("wps-") && f.endsWith(".etl"))
      .map((f) => ({
        path: path.join(logDir, f),
        time: fs.statSync(path.join(logDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time)
      .map((f) => f.path);
  } catch {
    return [];
  }
}

function getMcAfeeLastScan(): string | null {
  const files = getSortedEtlFiles();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      const match = content.match(/lastScanInformation:\s*(\d+)/);

      if (match) {
        const daysAgo = Number(match[1]);

        const scanDate = new Date();

        scanDate.setDate(scanDate.getDate() - daysAgo);

        return scanDate.toISOString();
      }
    } catch {}
  }

  return null;
}

function getMcAfeeExpiryDate(): string | null {
  const files = getSortedEtlFiles();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      const match = content.match(/"expiryTime":(\d+)/);

      if (match) {
        return new Date(Number(match[1])).toISOString();
      }
    } catch {}
  }

  return null;
}

export async function getMcAfeeMetrics(): Promise<McAfeeMetrics> {
  return {
    lastScan: getMcAfeeLastScan(),
    expiryDate: getMcAfeeExpiryDate(),
  };
}
