import sqlite3 from 'sqlite3';
import fs from 'fs';
import { logger } from '../logger.js';

export async function querySqliteDb<T>(
  dbPath: string,
  query: string,
  params: unknown[] = [],
): Promise<T[] | null> {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        logger.error({ err }, `Failed to open database: ${dbPath}`);
        resolve(null);
        return;
      }
    });

    db.all(query, params, (err, rows: T[] | undefined) => {
      db.close((closeErr) => {
        if (closeErr) {
          logger.debug({ err: closeErr }, 'Failed to close database');
        }
      });

      if (err) {
        logger.error({ err }, 'Database query failed');
        resolve(null);
        return;
      }

      resolve(rows ?? null);
    });
  });
}

export async function getSqliteValue<T>(
  dbPath: string,
  query: string,
  params: unknown[] = [],
): Promise<T | null> {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        logger.error({ err }, `Failed to open database: ${dbPath}`);
        resolve(null);
        return;
      }
    });

    db.get(query, params, (err, row: T | undefined) => {
      db.close((closeErr) => {
        if (closeErr) {
          logger.debug({ err: closeErr }, 'Failed to close database');
        }
      });

      if (err) {
        logger.error({ err }, 'Database query failed');
        resolve(null);
        return;
      }

      resolve(row ?? null);
    });
  });
}
