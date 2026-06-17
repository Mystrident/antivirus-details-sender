import { prisma } from "../prisma.js";
export async function syncExpiryAlert(stat) {
    if (!stat.expiryDate) {
        return;
    }
    const daysRemaining = Math.ceil((stat.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysRemaining <= 15) {
        await prisma.aVExpiryAlert.upsert({
            where: {
                location_assetId: {
                    location: stat.location,
                    assetId: stat.assetId,
                },
            },
            update: {
                expiryDate: stat.expiryDate,
            },
            create: {
                assetId: stat.assetId,
                location: stat.location,
                macAddress: stat.macAddress,
                expiryDate: stat.expiryDate,
            },
        });
    }
    else {
        await prisma.aVExpiryAlert.deleteMany({
            where: {
                location: stat.location,
                assetId: stat.assetId,
            },
        });
    }
}
