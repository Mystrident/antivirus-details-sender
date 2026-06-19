import cron from "node-cron";

import { prisma } from "../prisma.js";

export function startCleanupJob() {
  cron.schedule(
    "59 23 * * 4",

    async () => {
      try {
        console.log("Cleaning alert tables...");

        await prisma.aVScanAlert.deleteMany();

        await prisma.aVExpiryAlert.deleteMany();

        console.log("Alert tables cleared");
      } catch (error) {
        console.error("Cleanup failed", error);
      }
    },
  );
}
