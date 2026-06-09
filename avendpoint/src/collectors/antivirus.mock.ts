import type { AntivirusInfo } from "../types/antivirus.js";

export async function getMockAntivirusInfo(): Promise<AntivirusInfo> {
  return {
    productName: "Norton 360",
    version: "24.1.0",
    enabled: true,
    lastScan: null,
    expiryDate: null,
    needsUpdate: false,
  };
}
