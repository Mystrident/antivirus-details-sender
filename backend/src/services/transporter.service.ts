import dns from "node:dns";
import nodemailer from "nodemailer";

// Prefer IPv4 over IPv6
dns.setDefaultResultOrder("ipv4first");

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },

  tls: {
    minVersion: "TLSv1.2",
  },
});