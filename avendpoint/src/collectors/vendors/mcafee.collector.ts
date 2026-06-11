import type { AntivirusInfo } from "../../types/antivirus.js";
import { runPowerShell } from "../../utils/powershell.js";
import { getMcAfeeMetrics } from "./mcafee.db.js";

async function getMcAfeeVersion(): Promise<string | null> {
  try {
    const output = await runPowerShell(
      '(Get-ItemProperty "HKLM:\\SOFTWARE\\McAfee\\wps").version',
    );

    return output.trim() || null;
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

    signatureVersion: null,

    lastUpdateTime: null,

    quarantineCount: metrics.quarantineCount,

    lastThreatDetection: metrics.lastProtectionEvent,

    filesScanned: metrics.filesScanned,

    threatsDetected: metrics.threatsDetected,

    threatsResolved: metrics.threatsResolved,

    lastProtectionEvent: metrics.lastProtectionEvent,

    lastScan: metrics.lastProtectionEvent,

    expiryDate: null,

    needsUpdate: null,
  };
}
