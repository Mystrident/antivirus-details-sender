import { logger } from "../../logger.js";
import type { AntivirusInfo } from "../../types/antivirus.js";
import { getMcAfeeMetrics } from "./mcafee.db.js";
import Registry from "winreg";
import { AntivirusProduct } from "../../types/antivirus.js";
import { createAntivirusPayload } from "../../utils/telemetry-helpers.js";
import { REGISTRY_KEYS } from "../../config/constants.js";

function getMcAfeeVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: REGISTRY_KEYS.MCAFEE.key,
    });

    regKey.get(REGISTRY_KEYS.MCAFEE.value, (err, item) => {
      if (err || !item) {
        resolve(null);
      } else {
        resolve(item.value.trim());
      }
    });
  });
}

export async function collectMcAfee(
  product: AntivirusProduct,
): Promise<AntivirusInfo> {
  const version = await getMcAfeeVersion();
  const metrics = await getMcAfeeMetrics();

  logger.debug({ metrics }, "McAfee metrics collected");
  logger.info({ metrics }, "McAfee metrics collected");

  return createAntivirusPayload({
    productName: product.displayName,
    version,
    enabled: product.productState !== 0,
    lastScan: metrics.lastScan,
    expiryDate: metrics.expiryDate,
  });
}
