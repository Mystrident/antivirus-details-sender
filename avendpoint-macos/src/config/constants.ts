
import path from "path";

// ─── Application Root ─────────────────────────────────────────────────────────

const PROD_ROOT = "/Library/Application Support/EndpointAgent";
const DEV_ROOT = process.cwd();

export const IS_DEVELOPMENT =
  process.env.ENDPOINT_ENV === "development";

export const APP_ROOT = IS_DEVELOPMENT
  ? DEV_ROOT
  : PROD_ROOT;

// ─── macOS filesystem paths ───────────────────────────────────────────────────

export const MACOS_PATHS = {
  ROOT: APP_ROOT,

  CONFIG: path.join(APP_ROOT, "config.json"),

  HEARTBEAT: path.join(APP_ROOT, "heartbeat.txt"),

  NORTON_APP_PLIST:
    "/Applications/Norton.app/Contents/Info.plist",

  NORTON_LICENSE:
    "/Library/Application Support/Norton/state/license_leap.data",

  NORTON_ACTIVITY_DB:
    "/Library/Application Support/Norton/state/activity/activity.db",

  NORTON_DIR:
    "/Applications/Norton.app",
};

// ─── Info.plist keys ──────────────────────────────────────────────────────────

export const PLIST_KEYS = {
  NORTON: {
    DISPLAY_NAME: "CFBundleDisplayName",
    BUNDLE_NAME: "CFBundleName",
    VERSION: "CFBundleShortVersionString",
  },
};

// ─── license_leap.data field names ───────────────────────────────────────────

export const NORTON_LICENSE_KEYS = {
  STATE_PRIMARY: "p_olpstate",
  STATE_SECONDARY: "p_olpes",
  EXPIRY_TIME: "p_olplets",
  ENABLED_VALUE: "ENABLED",
};

// ─── Database queries ─────────────────────────────────────────────────────────

export const DATABASE_FIELDS = {
  NORTON: {
    TABLE_SCAN_HISTORY: "scan_history",
    COLUMN_EPOCH_TIME: "epoch_time",
  },
};

// ─── Temp file naming ─────────────────────────────────────────────────────────

export const TEMP_FILES = {
  NORTON_ACTIVITY_PREFIX: "norton-macos-activity-",
  EXTENSION_DB: ".db",
};

// ─── Cron schedules ───────────────────────────────────────────────────────────

export const SCHEDULES = {
  HOURLY: "0 * * * *",
};

// ─── API configuration ────────────────────────────────────────────────────────

export const API = {
  ENDPOINT_PATH: "/api/telemetry/antivirus",
  HEADER_KEY: "x-agent-key",
  PROTOCOL: "https://",
};

// ─── Product states ───────────────────────────────────────────────────────────

export const PRODUCT_STATE = {
  ENABLED: 1,
  DISABLED: 0,
};

// ─── Platform check ───────────────────────────────────────────────────────────

export const PLATFORMS = {
  MACOS: "darwin",
};