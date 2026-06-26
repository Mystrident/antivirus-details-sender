import fs from 'fs';
import type { AntivirusInfo } from '../types/antivirus.js';
import type { AntivirusProduct } from '../types/antivirus.js';
import { logger } from '../logger.js';
import { collectNorton } from './vendors/norton.collector.js';
import { collectGenericAntivirus } from './vendors/generic.collector.js';
import { MACOS_PATHS, PRODUCT_STATE } from '../config/constants.js';

function isNortonInstalled(): boolean {
  try {
    return fs.existsSync(MACOS_PATHS.NORTON_DIR);
  } catch {
    return false;
  }
}

export async function getMacOSAntivirusInfo(): Promise<AntivirusInfo> {
  try {
    if (isNortonInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName:  'Norton',
        productState: PRODUCT_STATE.ENABLED,
      };

      return collectNorton(antivirus);
    }

    return collectGenericAntivirus({
      displayName:  'Unknown',
      productState: PRODUCT_STATE.DISABLED,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to collect antivirus info');

    return {
      productName: 'Unknown',
      version:     null,
      enabled:     false,
      lastScan:    null,
      expiryDate:  null,
    };
  }
}
