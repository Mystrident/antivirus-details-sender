import type { AntivirusInfo } from "../types/antivirus.js";
import fs from "fs";

import { collectMcAfee } from "./vendors/mcafee.collector.js";
import { collectNorton } from "./vendors/norton.collector.js";
import { collectGenericAntivirus } from "./vendors/generic.collector.js";

interface AntivirusProduct {
  displayName: string;
  productState: number;
}

function isMcAfeeInstalled(): boolean {
  try {
    // Matches the directory where McAfee metrics and DB reside
    return fs.existsSync("C:\\ProgramData\\McAfee\\wps");
  } catch {
    return false;
  }
}

function isNortonInstalled(): boolean {
  try {
    // Matches the directory where Norton metrics and DB reside
    return fs.existsSync("C:\\ProgramData\\Norton\\Antivirus");
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
      lastScan: null,
      expiryDate: null,
      
    };
  }
}
