import cron from "node-cron";

import { generateScanCsv } from "../services/scan-report.service.js";

import { generateExpiryCsv } from "../services/expiry-report.service.js";

import { sendAlertMail } from "../services/email.service.js";

export function startWeeklyReportJob() {
  cron.schedule(
    "* * * * *",

    async () => {
      const scanCsv = await generateScanCsv();

      const expiryCsv = await generateExpiryCsv();

      await sendAlertMail(scanCsv, expiryCsv);
    },
  );
}
