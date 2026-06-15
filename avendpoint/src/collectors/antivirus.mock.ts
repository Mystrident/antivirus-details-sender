import type { AntivirusInfo } from "../types/antivirus.js";

export async function getMockAntivirusInfo(): Promise<AntivirusInfo> {
  return {
    productName: "Invalid OS",
    version: "0",
    enabled: false,
    
    quarantineCount: 0,
    
    lastScan: null,

    expiryDate: null,
    needsUpdate: false,

  };
}
