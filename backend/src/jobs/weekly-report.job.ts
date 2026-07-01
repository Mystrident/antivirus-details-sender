import cron from "node-cron";

import { generateScanCsv } from "../services/scan-report.service.js";

import { generateExpiryCsv } from "../services/expiry-report.service.js";

import { generateLastTelemetryCsv } from "../services/lastTelemetry-report.service.js";

import { sendAlertMail } from "../services/email.service.js";

export function startWeeklyReportJob() {
  cron.schedule("0 18 * * 5", async () => {
      const scanCsv = await generateScanCsv();

      const expiryCsv = await generateExpiryCsv();

      const lastTelemetryCsv = await generateLastTelemetryCsv();

      await sendAlertMail(scanCsv, expiryCsv, lastTelemetryCsv);
    },
  );
}