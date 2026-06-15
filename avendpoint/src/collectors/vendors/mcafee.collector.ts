import type { AntivirusInfo } from "../../types/antivirus.js";
import { enumerateValues, HKEY } from "registry-js";
import { getMcAfeeMetrics } from "./mcafee.db.js";

async function getMcAfeeVersion(): Promise<string | null> {
  try {
    const values = enumerateValues(
      HKEY.HKEY_LOCAL_MACHINE,
      "SOFTWARE\\McAfee\\wps",
    );

    const version = values.find((v) => v.name.toLowerCase() === "version");

    return version?.data?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function collectMcAfee(product: any): Promise<AntivirusInfo> {
  const version = await getMcAfeeVersion();

  const metrics = await getMcAfeeMetrics();

  console.log("MCAFEE METRICS:", metrics);

  return {
    productName: product.displayName,

    version,

    enabled: product.productState !== 0,

    quarantineCount: metrics.quarantineCount,

    lastScan: metrics.lastScan,

    expiryDate: metrics.expiryDate,

    needsUpdate: null,
  };
}
