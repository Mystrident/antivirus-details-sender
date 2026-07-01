import dotenv from "dotenv";
import util from "util";
import { logger } from "../logger.js";
import { transporter } from "./transporter.service.js";

dotenv.config();

export async function sendAlertMail(
  scanCsvPath: string,
  expiryCsvPath: string,
) {
  logger.info("========================================");
  logger.info("Weekly Antivirus Email");
  logger.info("========================================");

  logger.info({
    from: process.env.DEFAULT_FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
  }, "SMTP Configuration");

  logger.info({
    scanCsvPath,
    expiryCsvPath,
  }, "Attachments");

  try {

    logger.info({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USERNAME,
  from: process.env.DEFAULT_FROM_EMAIL,
  to: process.env.ADMIN_EMAIL,
}, "SMTP Environment");

logger.info("Verifying SMTP connection...");

await transporter.verify();

    logger.info("SMTP verification successful.");

    logger.info("Sending email...");

    const result = await transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "Weekly Antivirus Alert Report",
      text: "Attached are this week's antivirus reports.",
      attachments: [
        {
          filename: "scan-alerts.csv",
          path: scanCsvPath,
        },
        {
          filename: "expiry-alerts.csv",
          path: expiryCsvPath,
        },
      ],
    });

    logger.info({
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      
      envelope: result.envelope,
      response: result.response,
    }, "Email sent successfully");

  } catch (error: unknown) {

    const err = error as any;

    logger.error("========================================");
    logger.error("SMTP FAILED");
    logger.error("========================================");

    logger.error({
      name: err?.name,
      message: err?.message,
      code: err?.code,
      command: err?.command,
      errno: err?.errno,
      syscall: err?.syscall,
      address: err?.address,
      port: err?.port,
      response: err?.response,
      responseCode: err?.responseCode,
      stack: err?.stack,
    }, "SMTP Error Details");

    logger.error(util.inspect(err, {
      depth: null,
      colors: false,
    }), );

    throw error;
  }
}