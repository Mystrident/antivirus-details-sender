export async function collectNorton(product) {
    return {
        productName: product.displayName,
        version: null,
        enabled: product.productState !== 0,
        quarantineCount: 0,
        lastScan: null,
        expiryDate: null,
        needsUpdate: null,
    };
}
