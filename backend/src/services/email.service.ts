import nodemailer from "nodemailer";
import dotenv from "dotenv";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS,
  },
});

export async function sendAlertMail(scanCsv: string, expiryCsv: string) {
  console.log({
    EMAIL_USER: process.env.EMAIL_USER,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: process.env.ADMIN_EMAIL,

    subject: "Weekly Antivirus Alert Report",

    text: "Attached are this week's antivirus alerts.",

    attachments: [
      {
        filename: "scan-alerts.csv",

        path: scanCsv,
      },

      {
        filename: "expiry-alerts.csv",

        path: expiryCsv,
      },
    ],
  });
}
