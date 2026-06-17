import { prisma } from "../prisma.js";
export async function syncScanAlert(stat) {
    if (!stat.lastScanDate) {
        return;
    }
    const ageDays = Math.floor((Date.now() - stat.lastScanDate.getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays > 7) {
        await prisma.aVScanAlert.upsert({
            where: {
                location_assetId: {
                    location: stat.location,
                    assetId: stat.assetId,
                },
            },
            update: {
                lastScanDate: stat.lastScanDate,
            },
            create: {
                assetId: stat.assetId,
                location: stat.location,
                macAddress: stat.macAddress,
                lastScanDate: stat.lastScanDate,
            },
        });
    }
    else {
        await prisma.aVScanAlert.deleteMany({
            where: {
                location: stat.location,
                assetId: stat.assetId,
            },
        });
    }
}
