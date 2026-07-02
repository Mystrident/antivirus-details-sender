import type { AntivirusInfo } from '../types/antivirus.js';
import type { AntivirusProduct } from '../types/antivirus.js';
import fs from 'fs';
import { logger } from '../logger.js';

import { collectMcAfee } from './vendors/mcafee.collector.js';
import { collectNorton } from './vendors/norton.collector.js';
import { collectGenericAntivirus } from './vendors/generic.collector.js';
import { WINDOWS_PATHS, PRODUCT_STATE } from '../config/constants.js';

import Registry from "winreg";
import { REGISTRY_KEYS } from "../config/constants.js";

async function isMcAfeeInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: REGISTRY_KEYS.MCAFEE.key,
    });

    regKey.get(REGISTRY_KEYS.MCAFEE.value, (err, item) => {
      resolve(!err && !!item && item.value.trim().length > 0);
    });
  });
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
    if (await isMcAfeeInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: "McAfee",
        productState: PRODUCT_STATE.ENABLED,
      };

      return collectMcAfee(antivirus);
    }

    if (isNortonInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: "Norton",
        productState: PRODUCT_STATE.ENABLED,
      };

      return collectNorton(antivirus);
    }

    return collectGenericAntivirus({
      displayName: "Unknown",
      productState: PRODUCT_STATE.DISABLED,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to collect antivirus info");

    return {
      productName: "Unknown",
      version: null,
      enabled: false,
      lastScan: null,
      expiryDate: null,
    };
  }
}
