import "dotenv/config";
import { startScheduler, sendHeartbeat } from "./scheduler/scheduler.js";
import { logger } from "./logger.js";
import fs from "fs";

function startHeartbeat() {
  const update = () => {
    try {
      fs.writeFileSync("heartbeat.txt", Date.now().toString());
    } catch (err) {
      logger.error({ err }, "Failed updating heartbeat");
    }
  };

  update();

  setInterval(update, 60000);
}

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});

startHeartbeat();

async function bootstrap() {
  logger.info("Agent startup initiated");

  while (true) {
    try {
      await sendHeartbeat();

      logger.info("Initial telemetry uploaded");

      break;
    } catch (error) {
      logger.error(
        { err: error },
        "Initial telemetry upload failed. Retrying in 1 minute...",
      );

      await new Promise((resolve) => setTimeout(resolve, 60_000));
    }
  }

  startScheduler();
  logger.info("Agent started successfully");
}

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received");

  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received");

  process.exit(0);
});

bootstrap().catch((error) => {
  logger.fatal({ err: error }, "Bootstrap failed");
  process.exit(1);
});
