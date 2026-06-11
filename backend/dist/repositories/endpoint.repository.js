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
            hostname: payload.hostname,
        },
        update: {
            osName: payload.osName,
            lastSeen: new Date(payload.collectedAt),
            antivirus: {
                upsert: {
                    update: {
                        productName: payload.antivirus.productName,
                        version: payload.antivirus.version,
                        enabled: payload.antivirus.enabled,
                        signatureVersion: payload.antivirus.signatureVersion,
                        lastUpdateTime: payload.antivirus.lastUpdateTime
                            ? new Date(payload.antivirus.lastUpdateTime)
                            : null,
                        filesScanned: payload.antivirus.filesScanned,
                        threatsDetected: payload.antivirus.threatsDetected,
                        threatsResolved: payload.antivirus.threatsResolved,
                        quarantineCount: payload.antivirus.quarantineCount,
                        lastThreatDetection: payload.antivirus.lastThreatDetection
                            ? new Date(payload.antivirus.lastThreatDetection)
                            : null,
                        lastProtectionEvent: payload.antivirus.lastProtectionEvent
                            ? new Date(payload.antivirus.lastProtectionEvent)
                            : null,
                        lastScan: payload.antivirus.lastScan
                            ? new Date(payload.antivirus.lastScan)
                            : null,
                        expiryDate: payload.antivirus.expiryDate
                            ? new Date(payload.antivirus.expiryDate)
                            : null,
                        needsUpdate: payload.antivirus.needsUpdate,
                    },
                    create: {
                        productName: payload.antivirus.productName,
                        version: payload.antivirus.version,
                        enabled: payload.antivirus.enabled,
                        signatureVersion: payload.antivirus.signatureVersion,
                        lastUpdateTime: payload.antivirus.lastUpdateTime
                            ? new Date(payload.antivirus.lastUpdateTime)
                            : null,
                        filesScanned: payload.antivirus.filesScanned,
                        threatsDetected: payload.antivirus.threatsDetected,
                        threatsResolved: payload.antivirus.threatsResolved,
                        quarantineCount: payload.antivirus.quarantineCount,
                        lastThreatDetection: payload.antivirus.lastThreatDetection
                            ? new Date(payload.antivirus.lastThreatDetection)
                            : null,
                        lastProtectionEvent: payload.antivirus.lastProtectionEvent
                            ? new Date(payload.antivirus.lastProtectionEvent)
                            : null,
                        lastScan: payload.antivirus.lastScan
                            ? new Date(payload.antivirus.lastScan)
                            : null,
                        expiryDate: payload.antivirus.expiryDate
                            ? new Date(payload.antivirus.expiryDate)
                            : null,
                        needsUpdate: payload.antivirus.needsUpdate,
                    },
                },
            },
        },
        create: {
            hostname: payload.hostname,
            osName: payload.osName,
            lastSeen: new Date(payload.collectedAt),
            antivirus: {
                create: {
                    productName: payload.antivirus.productName,
                    version: payload.antivirus.version,
                    enabled: payload.antivirus.enabled,
                    signatureVersion: payload.antivirus.signatureVersion,
                    lastUpdateTime: payload.antivirus.lastUpdateTime
                        ? new Date(payload.antivirus.lastUpdateTime)
                        : null,
                    filesScanned: payload.antivirus.filesScanned,
                    threatsDetected: payload.antivirus.threatsDetected,
                    threatsResolved: payload.antivirus.threatsResolved,
                    quarantineCount: payload.antivirus.quarantineCount,
                    lastThreatDetection: payload.antivirus.lastThreatDetection
                        ? new Date(payload.antivirus.lastThreatDetection)
                        : null,
                    lastProtectionEvent: payload.antivirus.lastProtectionEvent
                        ? new Date(payload.antivirus.lastProtectionEvent)
                        : null,
                    lastScan: payload.antivirus.lastScan
                        ? new Date(payload.antivirus.lastScan)
                        : null,
                    expiryDate: payload.antivirus.expiryDate
                        ? new Date(payload.antivirus.expiryDate)
                        : null,
                    needsUpdate: payload.antivirus.needsUpdate,
                },
            },
        },
    });
}
