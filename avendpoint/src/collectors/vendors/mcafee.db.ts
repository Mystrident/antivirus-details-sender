import fs from "fs";
import os from "os";
import path from "path";
import sqlite3 from "sqlite3";

export interface McAfeeMetrics {
  quarantineCount: number;
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
        return `${match[1]} days ago`;
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

function getMcAfeeUiMetrics(): {
  lastScan: string | null;
  expiryDate: string | null;
} {
  return {
    lastScan: getMcAfeeLastScan(),
    expiryDate: getMcAfeeExpiryDate(),
  };
}

export async function getMcAfeeMetrics(): Promise<McAfeeMetrics> {
  const sourceDb = "C:\\ProgramData\\McAfee\\wps\\DA.db";
  const tempDb = path.join(os.tmpdir(), "mcafee-da.db");

  try {
    fs.copyFileSync(sourceDb, tempDb);
  } catch {
    const uiMetrics = getMcAfeeUiMetrics();

    return {
      quarantineCount: 0,
      lastScan: uiMetrics.lastScan,
      expiryDate: uiMetrics.expiryDate,
    };
  }

  return new Promise((resolve) => {
    const db = new sqlite3.Database(tempDb);

    const query = `
      SELECT
        c.VALUE_NAME,
        v.VALUE,
        v.TIMESTAMP
      FROM daeventvalues v
      JOIN daeventconfigs c
        ON v.CONFIG_ID = c.CONFIG_ID
      WHERE c.EVENT_ID = 'antivirus'
      ORDER BY v.TIMESTAMP DESC
      LIMIT 100
    `;

    db.all(query, [], (err, rows: any[]) => {
      db.close();

      try {
        fs.unlinkSync(tempDb);
      } catch {}

      const uiMetrics = getMcAfeeUiMetrics();

      if (err || !rows?.length) {
        resolve({
          quarantineCount: 0,
          lastScan: uiMetrics.lastScan,
          expiryDate: uiMetrics.expiryDate,
        });
        return;
      }

      console.log(rows.slice(0, 20));

      resolve({
        quarantineCount: Number(
          rows.find((r) => r.VALUE_NAME === "items_quarantined")?.VALUE ?? 0,
        ),
        lastScan: uiMetrics.lastScan,
        expiryDate: uiMetrics.expiryDate,
      });
    });
  });
}
