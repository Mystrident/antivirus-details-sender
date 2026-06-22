import "dotenv/config";
import express from "express";
import cors from "cors";
import { startWeeklyReportJob } from "./jobs/weekly-report.job.js";
import { startCleanupJob } from "./jobs/cleanup.job.js";

import telemetryRoutes from "./routes/telemetry.routes.js";
import { logger } from "./logger.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/telemetry", telemetryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
startCleanupJob();

startWeeklyReportJob();
