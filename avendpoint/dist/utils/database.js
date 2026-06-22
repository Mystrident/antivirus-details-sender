import sqlite3 from 'sqlite3';
import { logger } from '../logger.js';
export async function querySqliteDb(dbPath, query, params = []) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                logger.error({ err }, `Failed to open database: ${dbPath}`);
                resolve(null);
                return;
            }
        });
        db.all(query, params, (err, rows) => {
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
export async function getSqliteValue(dbPath, query, params = []) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                logger.error({ err }, `Failed to open database: ${dbPath}`);
                resolve(null);
                return;
            }
        });
        db.get(query, params, (err, row) => {
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
