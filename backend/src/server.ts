import "dotenv/config";
import express from "express";
import cors from "cors";
import { startWeeklyReportJob } from "./jobs/weekly-report.job.js";
import { startCleanupJob } from "./jobs/cleanup.job.js";
import dns from "node:dns/promises";

import telemetryRoutes from "./routes/telemetry.routes.js";
import { logger } from "./logger.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/telemetry", telemetryRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  console.log("========== DNS TEST ==========");

  try {
    const records = await dns.lookup(
      "smtp.office365.com",
      { all: true }
    );

    console.log(records);

  } catch (err) {

    console.error(err);

  }

  console.log("==============================");
})();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
startCleanupJob();

startWeeklyReportJob();
