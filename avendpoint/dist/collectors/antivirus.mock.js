export async function getMockAntivirusInfo() {
    return {
        productName: "Norton 360",
        version: "24.1.0",
        enabled: true,
        signatureVersion: null,
        lastUpdateTime: null,
        quarantineCount: 0,
        lastThreatDetection: null,
        lastScan: null,
        expiryDate: null,
        needsUpdate: false,
        filesScanned: null,
        lastProtectionEvent: null,
        threatsDetected: null,
        threatsResolved: null,
    };
}
