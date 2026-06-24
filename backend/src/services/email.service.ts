import dotenv from "dotenv";
import { logger } from "../logger.js";
import { transporter } from "./transporter.service.js";

dotenv.config();

export async function sendAlertMail(
  scanCsvPath: string,
  expiryCsvPath: string,
) {
  logger.info("Sending weekly antivirus report");

  try {
    logger.info("Creating transporter");

    logger.info("Verifying SMTP");

    await transporter.verify();

    logger.info("SMTP verified");

    logger.info("Calling sendMail");

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

    logger.info(
      {
        messageId: result.messageId,
        response: result.response,
      },
      "Email sent successfully",
    );
  } catch (error) {
    logger.error({ error }, "Failed to send email");
  }
}
