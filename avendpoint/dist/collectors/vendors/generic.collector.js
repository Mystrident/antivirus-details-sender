import { createAntivirusPayload } from '../../utils/telemetry-helpers.js';
import { PRODUCT_STATE } from '../../config/constants.js';
export async function collectGenericAntivirus(product) {
    return createAntivirusPayload({
        productName: product.displayName,
        version: null,
        enabled: product.productState !== PRODUCT_STATE.DISABLED,
        lastScan: null,
        expiryDate: null,
    });
}
