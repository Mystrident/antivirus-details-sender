import { prisma } from "../prisma.js";
import { daysBetween } from "../utils/date.js";

interface AVStatRecord {
  assetId: string;
  location: string;
  macAddress: string;
  platform:string;
  lastTelemetryReceived: Date | null;
}

export async function syncLastTelemetryAlert(stat: AVStatRecord) {
  if (!stat.lastTelemetryReceived) {
    return;
  }

  const age = daysBetween(stat.lastTelemetryReceived);

  if (age > 7) {
    await prisma.aVLastTelemetryAlert.upsert({
      where: {
        location_assetId: {
          location: stat.location,
          assetId: stat.assetId,
        },
      },

      update: {
        lastTelemetryReceived: stat.lastTelemetryReceived,

        macAddress: stat.macAddress,
      },

      create: {
        assetId: stat.assetId,

        location: stat.location,

        macAddress: stat.macAddress,

        platform:stat.platform,

        lastTelemetryReceived: stat.lastTelemetryReceived,
      },
    });
  } else {
    await prisma.aVLastTelemetryAlert.deleteMany({
      where: {
        assetId: stat.assetId,

        location: stat.location,
      },
    });
  }
}
