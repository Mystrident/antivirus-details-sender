console.log("generic collector");

import type { TelemetryPayload } from "../../types/telemetry.js";

export async function collectGenericAntivirus(
  product: any,
): Promise<TelemetryPayload["antivirus"]> {
  return {
    productName: product.displayName,

    version: null,

    enabled: product.productState !== 0,

    lastScan: null,

    expiryDate: null,
  };
}
