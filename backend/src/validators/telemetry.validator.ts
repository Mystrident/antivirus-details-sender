import { z } from "zod";

export const telemetrySchema = z.object({
  hostname: z.string(),

  osName: z.string(),

  macAddress: z.string(),

  username: z.string().nullable(),

  assetId: z.string().nullable(),

  location: z.string().nullable(),

  antivirus: z.object({
    productName: z.string(),

    version: z.string().nullable(),

    enabled: z.boolean(),

    lastScan: z.string().nullable(),

    expiryDate: z.string().nullable(),
  }),

  collectedAt: z.string(),
});
