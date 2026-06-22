import fs from 'fs';
import path from 'path';
import os from 'os';
import sqlite3 from 'sqlite3';
import type { NortonMetrics } from '../../types/antivirus.js';
import type { NortonRow } from '../../types/vendor-db.js';
import { logger } from '../../logger.js';
import { sortFilesByMtime, createTempFilePath, cleanupTempFile } from '../../utils/file-io.js';
import { extractTimestampFromContent, extractAndParseDate } from '../../utils/data-extraction.js';
import { querySqliteDb, getSqliteValue } from '../../utils/database.js';
import { WINDOWS_PATHS, FILE_PATTERNS, DATABASE_FIELDS, EXTRACTION_PATTERNS, PRODUCT_STATE, TEMP_FILES } from '../../config/constants.js';

function findNortonDb(): string | null {
  try {
    const files = fs
      .readdirSync(WINDOWS_PATHS.NORTON_DB)
      .filter((f) => f.toLowerCase().endsWith(FILE_PATTERNS.DB_FILES))
      .map((f) => ({
        fullPath: path.join(WINDOWS_PATHS.NORTON_DB, f),
        mtime: fs.statSync(path.join(WINDOWS_PATHS.NORTON_DB, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return files.length > 0 ? files[0].fullPath : null;
  } catch (err) {
    logger.debug({ err }, 'Failed to find Norton database');
    return null;
  }
}

function getExpiryDate(): string | null {
  try {
    const files = fs
      .readdirSync(WINDOWS_PATHS.NORTON_LOG)
      .filter((f) => {
        const lower = f.toLowerCase();
        const startsWithUi = lower.startsWith(FILE_PATTERNS.NORTON_UI_LOG_PREFIX);
        const hasLogExt = FILE_PATTERNS.LOG_FILES.some((ext) => lower.endsWith(ext));
        return startsWithUi && hasLogExt;
      })
      .map((f) => ({
        path: path.join(WINDOWS_PATHS.NORTON_LOG, f),
        mtime: fs.statSync(path.join(WINDOWS_PATHS.NORTON_LOG, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const matches = [...content.matchAll(EXTRACTION_PATTERNS.NORTON_LICENSE_EXPIRY)];

        if (matches.length === 0) {
          continue;
        }

        const latestMatch = matches[matches.length - 1];
        const unixSeconds = Number(latestMatch[1]);

        if (Number.isNaN(unixSeconds) || unixSeconds <= 0) {
          logger.debug('Norton license expired (licExpirationTime=0)');
          return PRODUCT_STATE.LICENSE_EXPIRED;
        }

        const expiryDate = extractAndParseDate(unixSeconds, true);
        if (expiryDate) {
          logger.debug({ expiryDate }, 'Norton expiry date found');
          return expiryDate;
        }
      } catch (err) {
        logger.error({ err, filePath: file.path }, 'Failed processing Norton log');
      }
    }
  } catch (err) {
    logger.error({ err }, 'Failed accessing Norton log directory');
  }

  return null;
}

export async function getNortonMetrics(): Promise<NortonMetrics> {
  logger.debug('Fetching Norton metrics');

  const sourceDb = findNortonDb();
  if (!sourceDb) {
    logger.debug('No Norton database found');
    return emptyMetrics();
  }

  const tempDb = createTempFilePath(TEMP_FILES.NORTON_DB_PREFIX, TEMP_FILES.EXTENSION_DB);

  try {
    fs.copyFileSync(sourceDb, tempDb);
  } catch (e) {
    logger.error({ err: e }, `Failed to copy Norton database from ${sourceDb}`);
    return emptyMetrics();
  }

  const expiryDate = getExpiryDate();

  try {
    const rows = await querySqliteDb<NortonRow>(
      tempDb,
      `SELECT ${DATABASE_FIELDS.NORTON.COLUMNS.name}, ${DATABASE_FIELDS.NORTON.COLUMNS.value}
       FROM ${DATABASE_FIELDS.NORTON.TABLE_NODE_VALUES}`,
    );

    if (!rows) {
      logger.debug('No Norton database rows retrieved');
      return { ...emptyMetrics(), expiryDate };
    }

    const values = new Map<string, string>();
    for (const row of rows) {
      values.set(String(row.name), row.value != null ? String(row.value) : '');
    }

    const state = values.get(DATABASE_FIELDS.NORTON.KEYS.state);
    let lastScan: string | null = null;

    try {
      const tempLogDb = createTempFilePath(TEMP_FILES.NORTON_LOG_PREFIX, TEMP_FILES.EXTENSION_DB);
      fs.copyFileSync(WINDOWS_PATHS.NORTON_LOG_DB, tempLogDb);

      const scanRow = await getSqliteValue<any>(
        tempLogDb,
        `SELECT Started FROM ${DATABASE_FIELDS.NORTON.TABLE_SCAN}
         WHERE Type = ${DATABASE_FIELDS.NORTON.SCAN_TYPE_FULL}
         ORDER BY Id DESC LIMIT 1`,
      );

      if (scanRow?.Started) {
        lastScan = extractAndParseDate(scanRow.Started, true);
      }

      await cleanupTempFile(tempLogDb);
    } catch (e) {
      logger.error({ err: e }, 'Failed reading Norton Log.db');
    }

    return {
      productName: values.get(DATABASE_FIELDS.NORTON.KEYS.productName) ?? null,
      version: values.get(DATABASE_FIELDS.NORTON.KEYS.version) ?? null,
      enabled: DATABASE_FIELDS.NORTON.STATES.enabled.includes(state || ''),
      lastScan,
      expiryDate,
    };
  } catch (error) {
    logger.error({ err: error }, 'Failed querying Norton database');
    return { ...emptyMetrics(), expiryDate };
  } finally {
    await cleanupTempFile(tempDb);
  }
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
