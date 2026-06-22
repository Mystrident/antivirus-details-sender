import fs from "fs";
import path from "path";
import os from "os";
import sqlite3 from "sqlite3";

export interface NortonMetrics {
  productName: string | null;
  version: string | null;

  enabled: boolean;

  lastScan: string | null;

  expiryDate: string | null;
}

function emptyMetrics(): NortonMetrics {
  return {
    productName: null,
    version: null,

    enabled: false,

    lastScan: null,

    expiryDate: null,
  };
}

function findNortonDb(): string | null {
  const dir = "C:\\ProgramData\\Norton\\Antivirus\\o2"; // Define the directory path where the Norton database files are located. This is a specific path on Windows systems where Norton Antivirus stores its database files.

  try {
    const dbFiles = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".db"))
      .map((f) => ({
        fullPath: path.join(dir, f),
        mtime: fs.statSync(path.join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);
    /*
      Before diving into each line, notice how the methods (.readdirSync(), .filter(), .map(), .sort()) are chained together using dots (.). The output of one line becomes the input for the next line. This allows the code to process the data in a continuous pipeline.

      Line-by-Line Breakdown
1. const dbFiles = fs
What it is: This declares a constant variable named dbFiles to store the final, sorted list of files.

fs: This stands for File System, a built-in Node.js module used to interact with your computer's physical files and directories.

2. .readdirSync(dir)
What it does: "Read Directory Synchronously." It looks inside the folder path specified by your dir variable (in your case, that Norton folder).

The output: It returns a simple array of strings containing the names of all files and folders inside that directory.

Example output at this stage: ['file1.txt', 'cache.db', 'logs.log', 'history.db']

3. .filter((f) => f.toLowerCase().endsWith(".db"))
What it does: This filters the array to keep only the files you care about. It loops through every file name (f) and checks a condition.

f.toLowerCase(): Converts the file name to lowercase so that .DB, .Db, and .db are all treated the same way.

.endsWith(".db"): A JavaScript string method that returns true if the file name ends with those specific characters. If it returns false, that file is kicked out of the array.

Example output at this stage: ['cache.db', 'history.db']

4. .map((f) => ({
What it does: The .map() method transforms the data. Instead of just having a list of raw string names, you are turning each filename (f) into a detailed JavaScript object {}.

The opening parenthesis and curly brace ({ is JavaScript shorthand to immediately return an object from an arrow function.

5. fullPath: path.join(dir, f),
What it does: This creates a property inside your new object called fullPath.

path.join(dir, f): This uses Node.js's built-in path module to cleanly glue the directory path and the filename together. For example, it turns "C:\\Norton" and "cache.db" into "C:\\Norton\\cache.db". It automatically handles messy slashes for you.

6. mtime: fs.statSync(path.join(dir, f)).mtimeMs,
What it does: This creates a second property inside your object called mtime (Modification Time).

fs.statSync(...): This goes back to the file system to grab the physical metadata of the file (size, creation date, permissions, etc.).

.mtimeMs: This extracts the exact millisecond timestamp of when the file was last modified or updated. It represents time as a large number (e.g., 1719050000000), which makes it incredibly easy to compare mathematically.

7. }))
What it is: This simply closes the object, the arrow function, and the .map() method from lines 4, 5, and 6.

Example output at this stage: ```javascript
[
{ fullPath: "C:\...\cache.db", mtime: 1719050000000 },
{ fullPath: "C:\...\history.db", mtime: 1719058000000 }
]


8. .sort((a, b) => b.mtime - a.mtime);
What it does: This sorts the array of objects by their modification timestamps.

How the math works: JavaScript's .sort() takes two items at a time (a and b). By subtracting a.mtime from b.mtime (b - a), it sorts the array in descending order (largest numbers first).

The Result: The file that was modified most recently (the newest file with the biggest timestamp number) moves to the very top of the list (index 0).

Summary of the Final Result
When this code finishes executing, dbFiles will hold an array of objects that looks like this, perfectly organized from newest to oldest:

JavaScript
[
  { 
    fullPath: "C:\\ProgramData\\Norton\\Antivirus\\o2\\history.db", 
    mtime: 1719058000000 // Newest file
  },
  { 
    fullPath: "C:\\ProgramData\\Norton\\Antivirus\\o2\\cache.db", 
    mtime: 1719050000000 // Older file
  }
]*/

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

    // thus expiry date is stored in nortonui*.log.old files, we need to read them to get the expiry date. We will read them starting from the newest one until we find a valid expiry date or run out of files.

    for (const file of files) {
      try {
        const tempFile = path.join(
          // Create a temporary file path in the system's temporary directory. This is necessary because we might not have permission to read the original log file directly, or it might be locked by Norton while it's running. By copying it to a temp location, we can safely read its contents without interference.
          os.tmpdir(),
          `norton-log-${Date.now()}-${Math.random().toString(36).slice(2)}.log`,
        );

        try {
          fs.copyFileSync(file.path, tempFile);
        } catch {
          continue;
        }

        const content = fs.readFileSync(tempFile, "utf8");

        try {
          fs.unlinkSync(tempFile); // Clean up the temporary file after reading its contents to avoid leaving unnecessary files on the system. This is done in a try-catch block to silently handle any errors that might occur during deletion, such as if the file is already deleted or if there are permission issues.
        } catch {}

        const matches = [
          ...content.matchAll(/"licExpirationTime"\s*:\s*(\d+)/gi),
        ];

        if (matches.length === 0) {
          continue;
        }

        const latestMatch = matches[matches.length - 1];

        const unixSeconds = Number(latestMatch[1]);

        if (Number.isNaN(unixSeconds)) {
          continue;
        }

        console.log("NORTON EXPIRY TIMESTAMP:", unixSeconds);

        const expiryDate = new Date(unixSeconds * 1000).toISOString();

        console.log("NORTON EXPIRY DATE:", expiryDate);

        return expiryDate;
      } catch (err) {
        console.error("Failed processing Norton log:", file.path, err);
      }
    }
  } catch (err) {
    console.error("Failed accessing Norton log directory:", err);
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
  console.log("NORTON EXPIRY DATE: ", expiryDate);

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
          const logDbPath = "C:\\ProgramData\\Norton\\Antivirus\\Log.db";

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

                if (scanErr || !scanRow || !scanRow.Started) {
                  resolveScan(null);
                  return;
                }

                resolveScan(
                  new Date(Number(scanRow.Started) * 1000).toISOString(),
                );
              },
            );
          });
        } catch (e) {
          console.error("Failed reading Log.db", e);
        }

        resolve({
          productName: values.get("prodName") ?? null,

          version: values.get("prodVersion") ?? null,

          enabled: state === "GOOD" || state === "ACTIVE",

          lastScan,

          expiryDate,
        });
      },
    );
  });
}
