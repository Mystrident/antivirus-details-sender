export function createAntivirusPayload(info) {
    return {
        productName: info.productName,
        version: info.version,
        enabled: info.enabled,
        lastScan: info.lastScan,
        expiryDate: info.expiryDate,
    };
}
