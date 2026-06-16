console.log("norton collector");

import type { AntivirusInfo } from "../../types/antivirus.js";
import { getNortonMetrics } from "./norton.db.js";

export async function collectNorton(product: any): Promise<AntivirusInfo> {
  const metrics = await getNortonMetrics();

  console.log("NORTON METRICS:", metrics);

  return {
    productName: metrics.productName ?? product.displayName,

    version: metrics.version,

    enabled: metrics.enabled,

    quarantineCount: metrics.quarantineCount,

    lastScan: metrics.lastScan,

    expiryDate: metrics.expiryDate,

    needsUpdate: null,
  };
}
