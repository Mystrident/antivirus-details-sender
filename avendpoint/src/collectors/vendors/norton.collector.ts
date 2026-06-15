import type { AntivirusInfo } from "../../types/antivirus.js";

export async function collectNorton(product: any): Promise<AntivirusInfo> {
  return {
    productName: product.displayName,
    version: null,

    enabled: product.productState !== 0,

    quarantineCount: 0,
    lastScan: null,
    expiryDate: null,

    needsUpdate: null,
  };
}
