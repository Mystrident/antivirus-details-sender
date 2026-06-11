import fs from "fs";
import os from "os";
import path from "path";
import sqlite3 from "sqlite3";

export interface McAfeeMetrics {
  filesScanned: number | null;
  threatsDetected: number | null;
  threatsResolved: number | null;
  quarantineCount: number;
  lastProtectionEvent: string | null;
}

export async function getMcAfeeMetrics(): Promise<McAfeeMetrics> {
  const sourceDb = "C:\\ProgramData\\McAfee\\wps\\DA.db";

  const tempDb = path.join(os.tmpdir(), "mcafee-da.db");

  try {
    fs.copyFileSync(sourceDb, tempDb);
  } catch {
    return {
      filesScanned: null,
      threatsDetected: null,
      threatsResolved: null,
      quarantineCount: 0,
      lastProtectionEvent: null,
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

      if (err || !rows?.length) {
        resolve({
          filesScanned: null,
          threatsDetected: null,
          threatsResolved: null,
          quarantineCount: 0,
          lastProtectionEvent: null,
        });
        return;
      }

      resolve({
        filesScanned:
          rows.find((r) => r.VALUE_NAME === "files_scanned")?.VALUE ?? null,

        threatsDetected:
          rows.find((r) => r.VALUE_NAME === "threats_detected")?.VALUE ?? null,

        threatsResolved:
          rows.find((r) => r.VALUE_NAME === "threats_resolved")?.VALUE ?? null,

        quarantineCount:
          rows.find((r) => r.VALUE_NAME === "items_quarantined")?.VALUE ?? 0,

        lastProtectionEvent: rows[0].TIMESTAMP ?? null,
      });
    });
  });
}
