import { getNortonMetrics } from './norton.db.js';
import { logger } from '../../logger.js';
import { createAntivirusPayload } from '../../utils/telemetry-helpers.js';
export async function collectNorton(product) {
    const metrics = await getNortonMetrics();
    logger.debug({ metrics }, 'Norton metrics collected');
    return createAntivirusPayload({
        productName: metrics.productName ?? product.displayName,
        version: metrics.version,
        enabled: metrics.enabled,
        lastScan: metrics.lastScan,
        expiryDate: metrics.expiryDate,
    });
}
