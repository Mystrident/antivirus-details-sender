import type { AntivirusInfo } from "../../types/antivirus.js";
import { getMcAfeeMetrics } from "./mcafee.db.js";
import Registry from "winreg";

function getMcAfeeVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: "\\SOFTWARE\\McAfee\\wps",
    });

    regKey.get("Version", (err, item) => {
      if (err || !item) {
        resolve(null);
      } else {
        resolve(item.value.trim());
      }
    });
  });
}

export async function collectMcAfee(product: any): Promise<AntivirusInfo> {
  const version = await getMcAfeeVersion();
  const metrics = await getMcAfeeMetrics();

  return {
    productName: product.displayName,
    version,
    enabled: product.productState !== 0,

    lastScan: metrics.lastScan,
    expiryDate: metrics.expiryDate,
  };
}
