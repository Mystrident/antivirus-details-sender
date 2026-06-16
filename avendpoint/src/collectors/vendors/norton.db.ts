console.log("norton db");

import fs from "fs";
import path from "path";
import os from "os";
import sqlite3 from "sqlite3";

export interface NortonMetrics {
  productName: string | null;
  version: string | null;

  enabled: boolean;

  quarantineCount: number;

  lastScan: string | null;

  expiryDate: string | null;
}

function emptyMetrics(): NortonMetrics {
  return {
    productName: null,
    version: null,

    enabled: false,

    quarantineCount: 0,

    lastScan: null,

    expiryDate: null,
  };
}

function findNortonDb(): string | null {
  const dir = "C:\\ProgramData\\Norton\\Antivirus\\o2";

  try {
    const dbFiles = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".db"))
      .map((f) => ({
        fullPath: path.join(dir, f),
        mtime: fs.statSync(path.join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return dbFiles.length > 0 ? dbFiles[0].fullPath : null;
  } catch {
    return null;
  }
}

function getExpiryDate(): string | null {
  const logDir = "C:\\ProgramData\\Norton\\Antivirus\\Log";

  try {
    const files = fs
      .readdirSync(logDir)
      .filter((f) => {
        const lower = f.toLowerCase();

        return (
          lower.startsWith("nortonui") &&
          (lower.endsWith(".log") || lower.endsWith(".log.old"))
        );
      })
      .map((f) => ({
        path: path.join(logDir, f),
        mtime: fs.statSync(path.join(logDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const file of files) {
      try {
        const tempFile = path.join(
          os.tmpdir(),
          `norton-log-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.log`,
        );

        try {
          fs.copyFileSync(file.path, tempFile);
        } catch {
          continue;
        }

        const content = fs.readFileSync(tempFile, "utf8");

        try {
          fs.unlinkSync(tempFile);
        } catch {}

        const matches = [
          ...content.matchAll(
            /"licExpirationTime"\s*:\s*(\d+)/gi,
          ),
        ];

        if (matches.length === 0) {
          continue;
        }

        const latestMatch = matches[matches.length - 1];

        const unixSeconds = Number(latestMatch[1]);

        if (Number.isNaN(unixSeconds)) {
          continue;
        }

        console.log(
          "NORTON EXPIRY TIMESTAMP:",
          unixSeconds,
        );

        const expiryDate = new Date(
          unixSeconds * 1000,
        ).toISOString();

        console.log(
          "NORTON EXPIRY DATE:",
          expiryDate,
        );

        return expiryDate;
      } catch (err) {
        console.error(
          "Failed processing Norton log:",
          file.path,
          err,
        );
      }
    }
  } catch (err) {
    console.error(
      "Failed accessing Norton log directory:",
      err,
    );
  }

  return null;
}

export async function getNortonMetrics(): Promise<NortonMetrics> {
  const sourceDb = findNortonDb();
  

  if (!sourceDb) {
    return emptyMetrics();
  }

  const tempDb = path.join(
    os.tmpdir(),
    `norton-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );

  try {
    fs.copyFileSync(sourceDb, tempDb);
  } catch {
    return emptyMetrics();
  }

  const expiryDate = getExpiryDate();
  console.log("NORTON EXPIRY DATE: ",expiryDate);

  

  return new Promise((resolve) => {
    const db = new sqlite3.Database(
      tempDb,
      sqlite3.OPEN_READONLY,
      (openErr) => {
        if (openErr) {
          try {
            fs.unlinkSync(tempDb);
          } catch {}

          resolve({
            ...emptyMetrics(),
            expiryDate,
          });
        }
      },
    );

    db.all(
  `
  SELECT name, value
  FROM node_values
  WHERE node_id IN (8, 9)
  `,
  [],
  async (err, rows: any[]) => {
    db.close(() => {
      try {
        fs.unlinkSync(tempDb);
      } catch {}
    });

    if (err) {
      resolve({
        ...emptyMetrics(),
        expiryDate,
      });
      return;
    }

    const values = new Map<string, string>();

    for (const row of rows ?? []) {
      values.set(
        String(row.name),
        row.value != null ? String(row.value) : "",
      );
    }

    const state = values.get("state");

    let lastScan: string | null = null;

    try {
      const logDbPath =
        "C:\\ProgramData\\Norton\\Antivirus\\Log.db";

      const tempLogDb = path.join(
        os.tmpdir(),
        `norton-log-${Date.now()}.db`,
      );

      fs.copyFileSync(logDbPath, tempLogDb);

      lastScan = await new Promise<string | null>((resolveScan) => {
        const scanDb = new sqlite3.Database(
          tempLogDb,
          sqlite3.OPEN_READONLY,
        );

        scanDb.get(
          `
          SELECT Started
          FROM ScanSession
          WHERE Type = 3
          ORDER BY Id DESC
          LIMIT 1
          `,
          [],
          (scanErr, scanRow: any) => {
            scanDb.close(() => {
              try {
                fs.unlinkSync(tempLogDb);
              } catch {}
            });

            if (
              scanErr ||
              !scanRow ||
              !scanRow.Started
            ) {
              resolveScan(null);
              return;
            }

            resolveScan(
              new Date(
                Number(scanRow.Started) * 1000,
              ).toISOString(),
            );
          },
        );
      });
    } catch (e) {
      console.error("Failed reading Log.db", e);
    }

    resolve({
      productName:
        values.get("prodName") ?? null,

      version:
        values.get("prodVersion") ?? null,

      enabled:
        state === "GOOD" ||
        state === "ACTIVE",

      quarantineCount: 0,

      lastScan,

      expiryDate,

      
    });
  },
);
  });
}
