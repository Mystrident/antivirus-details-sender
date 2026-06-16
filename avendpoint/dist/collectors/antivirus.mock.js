export async function getMockAntivirusInfo() {
    return {
        productName: "Invalid OS",
        version: "0",
        enabled: false,
        lastScan: null,
        expiryDate: null,
    };
}
