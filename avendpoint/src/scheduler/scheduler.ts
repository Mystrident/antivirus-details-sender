import schedule from "node-schedule";
import { sendFridayTelemetry } from "../services/friday-telemetry.service.js";

import { collectTelemetry } from "../services/telemetry.service.js";
import { sendTelemetry } from "../transport/api.js";

async function sendHeartbeat() {
  try {
    const payload = await collectTelemetry();

    console.log("FULL PAYLOAD:", JSON.stringify(payload, null, 2));

    await sendTelemetry(payload);

    console.log(`[${new Date().toISOString()}] heartbeat sent`);
  } catch (error) {
    console.error(error);
  }
}

export function startScheduler() {
  console.log("Friday scheduler started");

  sendFridayTelemetry();

  schedule.scheduleJob("0 * * * *", async () => {
    await sendFridayTelemetry();
  });
}

export { sendHeartbeat };
