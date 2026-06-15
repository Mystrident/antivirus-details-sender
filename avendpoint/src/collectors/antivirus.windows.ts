import type { AntivirusInfo } from "../types/antivirus.js";

import { enumerateValues, HKEY } from "registry-js";

import { collectMcAfee } from "./vendors/mcafee.collector.js";
import { collectNorton } from "./vendors/norton.collector.js";
import { collectGenericAntivirus } from "./vendors/generic.collector.js";

interface AntivirusProduct {
  displayName: string;
  productState: number;
}

function isMcAfeeInstalled(): boolean {
  try {
    return (
      enumerateValues(HKEY.HKEY_LOCAL_MACHINE, "SOFTWARE\\McAfee\\wps").length >
      0
    );
  } catch {
    return false;
  }
}

function isNortonInstalled(): boolean {
  try {
    return (
      enumerateValues(HKEY.HKEY_LOCAL_MACHINE, "SOFTWARE\\Norton").length > 0
    );
  } catch {
    return false;
  }
}

export async function getWindowsAntivirusInfo(): Promise<AntivirusInfo> {
  try {
    if (isMcAfeeInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: "McAfee",
        productState: 1,
      };

      return collectMcAfee(antivirus);
    }

    if (isNortonInstalled()) {
      const antivirus: AntivirusProduct = {
        displayName: "Norton",
        productState: 1,
      };

      return collectNorton(antivirus);
    }

    return collectGenericAntivirus({
      displayName: "Unknown",
      productState: 0,
    });
  } catch (error) {
    console.error("Failed to collect antivirus info:", error);

    return {
      productName: "Unknown",
      version: null,
      enabled: false,
      quarantineCount: 0,
      lastScan: null,
      expiryDate: null,
      needsUpdate: null,
    };
  }
}
