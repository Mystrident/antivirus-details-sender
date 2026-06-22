import { Resend } from "resend";
import dotenv from "dotenv";
import { logger } from "../logger.js";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendAlertMail(scanCsvPath, expiryCsvPath) {
    logger.info("Sending weekly antivirus report");
    const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: process.env.ADMIN_EMAIL,
        subject: "Weekly Antivirus Alert Report",
        text: "Attached are this week's antivirus reports.",
        attachments: [
            {
                filename: "scan-alerts.csv",
                content: Buffer.from(await import("fs").then((fs) => fs.readFileSync(scanCsvPath))).toString("base64"),
            },
            {
                filename: "expiry-alerts.csv",
                content: Buffer.from(await import("fs").then((fs) => fs.readFileSync(expiryCsvPath))).toString("base64"),
            },
        ],
    });
    logger.info({ result }, "Email sent");
}
