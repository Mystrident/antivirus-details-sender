import { logger } from "../../logger.js";
import { getMcAfeeMetrics } from "./mcafee.db.js";
import Registry from "winreg";
import { createAntivirusPayload } from "../../utils/telemetry-helpers.js";
import { REGISTRY_KEYS } from "../../config/constants.js";
function getMcAfeeVersion() {
    return new Promise((resolve) => {
        const regKey = new Registry({
            hive: Registry.HKLM,
            key: REGISTRY_KEYS.MCAFEE.key,
        });
        regKey.get(REGISTRY_KEYS.MCAFEE.value, (err, item) => {
            if (err || !item) {
                resolve(null);
            }
            else {
                resolve(item.value.trim());
            }
        });
    });
}
export async function collectMcAfee(product) {
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
