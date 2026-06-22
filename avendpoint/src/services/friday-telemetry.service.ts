import { getAgentConfig, saveAgentConfig } from "../config/agent-config.js";

import { collectTelemetry } from "./telemetry.service.js";

import { sendTelemetry } from "../transport/api.js";

import { isFriday, getTodayString } from "../utils/friday.js";

export async function sendFridayTelemetry() {
  const config = getAgentConfig();

  if (!isFriday()) {
    return;
  }

  const today = getTodayString();

  if (config.lastTelemetrySent === today) {
    return;
  }

  const payload = await collectTelemetry();

  await sendTelemetry(payload);

  config.lastTelemetrySent = today;

  saveAgentConfig(config);

  console.log("Friday telemetry sent");
}
