import { prisma } from "../prisma.js";
export async function getAllEndpoints() {
    return prisma.endpoint.findMany({
        include: {
            antivirus: true,
        },
        orderBy: {
            lastSeen: "desc",
        },
    });
}
export async function upsertEndpoint(payload) {
    return prisma.endpoint.upsert({
        where: {
            macAddress: payload.macAddress,
        },
        update: {
            hostname: payload.hostname,
            osName: payload.osName,
            username: payload.username,
            assetId: payload.assetId,
            location: payload.location,
            antivirus: {
                upsert: {
                    update: {
                        productName: payload.antivirus.productName,
                        version: payload.antivirus.version,
                        enabled: payload.antivirus.enabled,
                        lastScan: payload.antivirus.lastScan,
                        expiryDate: payload.antivirus.expiryDate
                            ? new Date(payload.antivirus.expiryDate)
                            : null,
                    },
                    create: {
                        productName: payload.antivirus.productName,
                        version: payload.antivirus.version,
                        enabled: payload.antivirus.enabled,
                        lastScan: payload.antivirus.lastScan,
                        expiryDate: payload.antivirus.expiryDate
                            ? new Date(payload.antivirus.expiryDate)
                            : null,
                    },
                },
            },
        },
        create: {
            hostname: payload.hostname,
            osName: payload.osName,
            macAddress: payload.macAddress,
            username: payload.username,
            assetId: payload.assetId,
            location: payload.location,
            lastSeen: new Date(payload.collectedAt),
            antivirus: {
                create: {
                    productName: payload.antivirus.productName,
                    version: payload.antivirus.version,
                    enabled: payload.antivirus.enabled,
                    lastScan: payload.antivirus.lastScan,
                    expiryDate: payload.antivirus.expiryDate
                        ? new Date(payload.antivirus.expiryDate)
                        : null,
                },
            },
        },
    });
}
