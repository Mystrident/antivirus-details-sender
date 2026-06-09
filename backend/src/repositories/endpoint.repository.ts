import { prisma } from "../prisma.js";
import type { TelemetryPayload } from "../types/telemetry.js";

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

export async function upsertEndpoint(payload: TelemetryPayload) {
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
