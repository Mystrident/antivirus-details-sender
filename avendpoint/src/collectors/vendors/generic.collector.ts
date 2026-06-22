console.log("generic collector");

import type { TelemetryPayload } from "../../types/telemetry.js";

export async function collectGenericAntivirus(
  product: any,
): Promise<TelemetryPayload["antivirus"]>// define an asynchronous function to collect generic antivirus information. it takes a product object as input and returns a promise that resolves to the antivirus telemetry payload. "antivirus" is a property of the TelemetryPayload interface, which contains information about the antivirus product, such as its name, version, enabled status, last scan date, and expiry date.
{
  return {
    productName: product.displayName,

    version: null,

    enabled: product.productState !== 0,

    lastScan: null,

    expiryDate: null,
  };
}
