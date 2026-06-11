export async function collectNorton(product) {
    return {
        productName: product.displayName,
        version: null,
        enabled: product.productState !== 0,
        signatureVersion: null,
        lastUpdateTime: null,
        quarantineCount: 0,
        lastThreatDetection: null,
        lastScan: null,
        expiryDate: null,
        needsUpdate: null,
        filesScanned: null,
        lastProtectionEvent: null,
        threatsDetected: null,
        threatsResolved: null,
    };
}
