import cron from "node-cron";
import { prisma } from "../prisma.js";
import { logger } from "../logger.js";
export function startCleanupJob() {
    cron.schedule("59 23 * * 4", async () => {
        try {
            logger.info("Cleaning alert tables");
            await prisma.aVScanAlert.deleteMany();
            await prisma.aVExpiryAlert.deleteMany();
            logger.info("Alert tables cleared");
        }
        catch (error) {
            logger.error({ error }, "Cleanup failed");
        }
    });
}
