// Windows paths
export const WINDOWS_PATHS = {
  CONFIG: 'C:\\ProgramData\\EndpointAgent\\config.json',
  MCAFEE_DIR: 'C:\\ProgramData\\McAfee\\wps',
  MCAFEE_LOG: 'C:\\ProgramData\\McAfee\\wps\\log',
  NORTON_DIR: 'C:\\ProgramData\\Norton\\Antivirus',
  NORTON_DB: 'C:\\ProgramData\\Norton\\Antivirus\\o2',
  NORTON_LOG: 'C:\\ProgramData\\Norton\\Antivirus\\Log',
  NORTON_LOG_DB: 'C:\\ProgramData\\Norton\\Antivirus\\Log.db',
};

// Registry paths
export const REGISTRY_KEYS = {
  MCAFEE: { hive: 'HKLM', key: '\\SOFTWARE\\McAfee\\wps', value: 'Version' },
};

// File extensions & patterns
export const FILE_PATTERNS = {
  DB_FILES: '.db',
  ETL_FILES: '.etl',
  LOG_FILES: ['.log', '.log.old'],
  MCAFEE_ETL_PREFIX: 'wps-',
  NORTON_UI_LOG_PREFIX: 'nortonui',
};

// Database queries & field names
export const DATABASE_FIELDS = {
  NORTON: {
    TABLE_NODE_VALUES: 'node_values',
    COLUMNS: { name: 'name', value: 'value' },
    KEYS: { productName: 'prodName', version: 'prodVersion', state: 'state' },
    STATES: { enabled: ['GOOD', 'ACTIVE'] },
    TABLE_SCAN: 'ScanSession',
    SCAN_TYPE_FULL: 3,
  },
};

// Regex patterns for data extraction
export const EXTRACTION_PATTERNS = {
  NORTON_LICENSE_EXPIRY: /"licExpirationTime"\s*:\s*(\d+)/gi,
  MCAFEE_SCAN_TIMESTAMP: /Formatting timestamp:\s*(\d+)/,
  MCAFEE_EXPIRY_TIME: /"expiryTime":(\d+)/,
};

// Cron schedules
export const SCHEDULES = {
  HOURLY: '0 * * * *',
};

// API configuration
export const API = {
  ENDPOINT_PATH: '/api/telemetry/antivirus',
  HEADER_KEY: 'x-agent-key',
  PROTOCOL: 'https://',
};

// Temp file naming
export const TEMP_FILES = {
  NORTON_DB_PREFIX: 'norton-',
  NORTON_LOG_PREFIX: 'norton-log-',
  EXTENSION_DB: '.db',
  EXTENSION_LOG: '.log',
};

// Product states
export const PRODUCT_STATE = {
  ENABLED: 1,
  DISABLED: 0,
  LICENSE_EXPIRED: 'EXPIRED',
};

// Platform check
export const PLATFORMS = {
  WINDOWS: 'win32',
};
