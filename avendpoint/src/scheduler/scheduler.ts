import schedule from "node-schedule";

import { buildTelemetryPayload } from "../services/telemetry.service.js";
import { sendTelemetry } from "../transport/api.js";

async function sendHeartbeat() {
  try {
    const payload = await buildTelemetryPayload();

    await sendTelemetry(payload);

    console.log(`[${new Date().toISOString()}] heartbeat sent`);
  } catch (error) {
    console.error(error);
  }
}

export function startScheduler() {
  schedule.scheduleJob("*/5 * * * *", sendHeartbeat);
}

export { sendHeartbeat };
