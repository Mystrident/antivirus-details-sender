import { z } from "zod";

export const telemetrySchema = z.object({
  macAddress: z.string(),

  assetId: z.string(),

  location: z.string(),
  
  platform: z.string(),

  antivirus: z.object({
    productName: z.string(),

    version: z.string().nullable(),

    enabled: z.boolean(),

    lastScan: z.string().nullable(),

    expiryDate: z.string().nullable(),
  }),

  collectedAt: z.string(),
});
