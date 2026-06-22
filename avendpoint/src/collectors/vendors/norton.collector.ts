import type { TelemetryPayload } from "../../types/telemetry.js";
import { getNortonMetrics } from "./norton.db.js";

export async function collectNorton(
  product: any,
): Promise<TelemetryPayload["antivirus"]> {
  const metrics = await getNortonMetrics();

  console.log("NORTON METRICS:", metrics);

  return {
    productName: metrics.productName ?? product.displayName,

    version: metrics.version,

    enabled: metrics.enabled,

    lastScan: metrics.lastScan,

    expiryDate: metrics.expiryDate,
  };
}
