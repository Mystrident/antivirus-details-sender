import type { AntivirusInfo } from '../types/antivirus.js';
import type { AntivirusProduct } from '../types/antivirus.js';
import fs from 'fs';
import { logger } from '../logger.js';

import { collectMcAfee } from './vendors/mcafee.collector.js';
import { collectNorton } from './vendors/norton.collector.js';
import { collectGenericAntivirus } from './vendors/generic.collector.js';
import { WINDOWS_PATHS, PRODUCT_STATE } from '../config/constants.js';

function isMcAfeeInstalled(): boolean {
  try {
    return fs.existsSync(WINDOWS_PATHS.MCAFEE_DIR);
  } catch {
    return false;
  }
}

function isNortonInstalled(): boolean {
  try {
    return fs.existsSync(WINDOWS_PATHS.NORTON_DIR);
  } catch {
    return false;
  }
}

export async function getWindowsAntivirusInfo(): Promise<AntivirusInfo> {
  try {
    if (isMcAfeeInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: 'McAfee',
        productState: PRODUCT_STATE.ENABLED,
      };

      return collectMcAfee(antivirus);
    }

    if (isNortonInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: 'Norton',
        productState: PRODUCT_STATE.ENABLED,
      };

      return collectNorton(antivirus);
    }

    return collectGenericAntivirus({
      displayName: 'Unknown',
      productState: PRODUCT_STATE.DISABLED,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to collect antivirus info');

    return {
      productName: 'Unknown',
      version: null,
      enabled: false,
      lastScan: null,
      expiryDate: null,
    };
  }
}
