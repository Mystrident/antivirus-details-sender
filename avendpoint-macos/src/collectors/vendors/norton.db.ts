import fs from 'fs';
import { logger } from '../../logger.js';
import { execSync } from 'child_process';
import type { NortonMetrics } from '../../types/antivirus.js';
import type { NortonActivityRow } from '../../types/vendor-db.js';
import { getSqliteValue } from '../../utils/database.js';
import { createTempFilePath, cleanupTempFile } from '../../utils/file-io.js';
import { extractAndParseDate } from '../../utils/data-extraction.js';
import {
  MACOS_PATHS,
  PLIST_KEYS,
  NORTON_LICENSE_KEYS,
  DATABASE_FIELDS,
  TEMP_FILES,
} from '../../config/constants.js';

// ─── Plist ────────────────────────────────────────────────────────────────────

/**
 * Reads a single string value from an Info.plist using the system `defaults`
 * command, which handles both binary and XML plist formats transparently.
 * Returns null on any error so callers can fall through to a fallback key.
 */
function readPlistValue(plistPath: string, key: string): string | null {
  try {
    // `defaults read-type` would require the domain form; `plutil` is safer for
    // arbitrary paths. We use `defaults read <path-without-.plist> <key>` which
    // works for both XML and binary plists when given the full path.
    const result = execSync(`defaults read "${plistPath}" "${key}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

function getNortonProductName(): string | null {
  const displayName = readPlistValue(
    MACOS_PATHS.NORTON_APP_PLIST,
    PLIST_KEYS.NORTON.DISPLAY_NAME,
  );

  if (displayName) {
    return displayName;
  }

  return readPlistValue(MACOS_PATHS.NORTON_APP_PLIST, PLIST_KEYS.NORTON.BUNDLE_NAME);
}

function getNortonVersion(): string | null {
  return readPlistValue(MACOS_PATHS.NORTON_APP_PLIST, PLIST_KEYS.NORTON.VERSION);
}

// ─── license_leap.data ───────────────────────────────────────────────────────

/**
 * Parses the plain ASCII key=value license file into a Map.
 * Lines that do not contain '=' are silently skipped.
 */
function parseLicenseFile(content: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const line of content.split('\n')) {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key   = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();

    if (key.length > 0) {
      map.set(key, value);
    }
  }

  return map;
}

function readLicenseFile(): Map<string, string> | null {
  try {
    if (!fs.existsSync(MACOS_PATHS.NORTON_LICENSE)) {
      logger.debug('Norton license file not found');
      return null;
    }

    const content = fs.readFileSync(MACOS_PATHS.NORTON_LICENSE, 'utf8');
    return parseLicenseFile(content);
  } catch (err) {
    logger.error({ err }, 'Failed to read Norton license file');
    return null;
  }
}

function getNortonEnabled(licenseData: Map<string, string>): boolean {
  const primary   = licenseData.get(NORTON_LICENSE_KEYS.STATE_PRIMARY);
  const secondary = licenseData.get(NORTON_LICENSE_KEYS.STATE_SECONDARY);

  return (
    primary   === NORTON_LICENSE_KEYS.ENABLED_VALUE ||
    secondary === NORTON_LICENSE_KEYS.ENABLED_VALUE
  );
}

function getNortonExpiryDate(licenseData: Map<string, string>): string | null {
  const raw = licenseData.get(NORTON_LICENSE_KEYS.EXPIRY_TIME);
  if (!raw) return null;

  return extractAndParseDate(raw, true);
}

// ─── activity.db ─────────────────────────────────────────────────────────────

/**
 * Copies the live SQLite database to a temp path before querying so that the
 * agent does not hold a read lock on the file Norton is actively writing to.
 * This mirrors the Windows implementation's temp-copy pattern exactly.
 */
async function getNortonLastScan(): Promise<string | null> {
  if (!fs.existsSync(MACOS_PATHS.NORTON_ACTIVITY_DB)) {
    logger.debug('Norton activity database not found');
    return null;
  }

  const tempDb = createTempFilePath(TEMP_FILES.NORTON_ACTIVITY_PREFIX, TEMP_FILES.EXTENSION_DB);

  try {
    fs.copyFileSync(MACOS_PATHS.NORTON_ACTIVITY_DB, tempDb);
  } catch (err) {
    logger.error({ err }, `Failed to copy Norton activity database`);
    return null;
  }

  try {
    const row = await getSqliteValue<NortonActivityRow>(
      tempDb,
      `SELECT ${DATABASE_FIELDS.NORTON.COLUMN_EPOCH_TIME}
       FROM   ${DATABASE_FIELDS.NORTON.TABLE_SCAN_HISTORY}
       ORDER  BY ${DATABASE_FIELDS.NORTON.COLUMN_EPOCH_TIME} DESC
       LIMIT  1`,
    );

    if (!row?.epoch_time) {
      logger.debug('No rows in Norton scan_history');
      return null;
    }

    const lastScan = extractAndParseDate(row.epoch_time, true);
    logger.debug({ lastScan }, 'Norton last scan found');
    return lastScan;
  } catch (err) {
    logger.error({ err }, 'Failed to query Norton activity database');
    return null;
  } finally {
    await cleanupTempFile(tempDb);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

function emptyMetrics(): NortonMetrics {
  return {
    productName: null,
    version:     null,
    enabled:     false,
    lastScan:    null,
    expiryDate:  null,
  };
}

export async function getNortonMetrics(): Promise<NortonMetrics> {
  logger.debug('Fetching Norton macOS metrics');

  const licenseData = readLicenseFile();

  const productName = getNortonProductName();
  const version     = getNortonVersion();
  const enabled     = licenseData ? getNortonEnabled(licenseData) : false;
  const expiryDate  = licenseData ? getNortonExpiryDate(licenseData) : null;
  const lastScan    = await getNortonLastScan();

  if (!productName && !version && !licenseData) {
    logger.debug('No Norton data found on this system');
    return emptyMetrics();
  }

  return { productName, version, enabled, lastScan, expiryDate };
}
