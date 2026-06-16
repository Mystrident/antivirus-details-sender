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
  const logDir = "C:\\ProgramData\\Norton\\VPN\\log";

  try {
    const files = fs
      .readdirSync(logDir)
      .filter((f) => f.toLowerCase().startsWith("vpn_svc"))
      .map((f) => ({
        path: path.join(logDir, f),
        mtime: fs.statSync(path.join(logDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, "utf8");

        const matches = [...content.matchAll(/expirationTime:\s*(\d+)/g)];

        const latestMatch = matches.at(-1);

        if (!latestMatch) {
          continue;
        }

        const unixSeconds = Number(latestMatch[1]);

        if (Number.isNaN(unixSeconds)) {
          continue;
        }

        return new Date(unixSeconds * 1000).toISOString();
      } catch {
        continue;
      }
    }
  } catch {}

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
      (err, rows: any[]) => {
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

        resolve({
          productName: values.get("prodName") ?? null,

          version: values.get("prodVersion") ?? null,

          enabled: state === "GOOD" || state === "ACTIVE",

          quarantineCount: 0,

          lastScan: null,

          expiryDate,
        });
      },
    );
  });
}
