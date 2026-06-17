import { prisma } from "../prisma.js";
function parseDate(value) {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return null;
    }
    return date;
}
export async function upsertAVStat(payload) {
    return prisma.aVStatRepo.upsert({
        where: {
            location_assetId: {
                location: payload.location ?? "",
                assetId: payload.assetId ?? "",
            },
        },
        update: {
            macAddress: payload.macAddress,
            avInstalled: payload.antivirus.productName,
            version: payload.antivirus.version,
            lastScanDate: parseDate(payload.antivirus.lastScan),
            expiryDate: parseDate(payload.antivirus.expiryDate),
            lastTelemetryReceived: new Date(payload.collectedAt),
        },
        create: {
            assetId: payload.assetId,
            location: payload.location,
            macAddress: payload.macAddress,
            avInstalled: payload.antivirus.productName,
            version: payload.antivirus.version,
            lastScanDate: payload.antivirus.lastScan
                ? new Date(payload.antivirus.lastScan)
                : null,
            expiryDate: payload.antivirus.expiryDate
                ? new Date(payload.antivirus.expiryDate)
                : null,
            lastTelemetryReceived: new Date(payload.collectedAt),
        },
    });
}
