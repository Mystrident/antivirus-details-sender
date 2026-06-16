export async function getMockAntivirusInfo() {
    return {
        productName: "Invalid OS",
        version: "0",
        enabled: false,
        quarantineCount: 0,
        lastScan: null,
        expiryDate: null,
        needsUpdate: false,
    };
}
