import { prisma } from "../prisma.js";
import { daysBetween } from "../utils/date.js";

interface AVStatRecord {
  assetId: string;
  location: string;
  macAddress: string;
  lastScanDate: Date | null;
}

export async function syncScanAlert(stat: AVStatRecord) {
  if (!stat.lastScanDate) {
    return;
  }

  const age = daysBetween(stat.lastScanDate);

  if (age > 7) {
    await prisma.aVScanAlert.upsert({
      where: {
        location_assetId: {
          location: stat.location,
          assetId: stat.assetId,
        },
      },

      update: {
        lastScanDate: stat.lastScanDate,

        macAddress: stat.macAddress,
      },

      create: {
        assetId: stat.assetId,

        location: stat.location,

        macAddress: stat.macAddress,

        lastScanDate: stat.lastScanDate,
      },
    });
  } else {
    await prisma.aVScanAlert.deleteMany({
      where: {
        assetId: stat.assetId,

        location: stat.location,
      },
    });
  }
}
