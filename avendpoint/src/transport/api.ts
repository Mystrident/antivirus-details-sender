import axios from "axios";
import { config } from "../config/config.js";
import type { TelemetryPayload } from "../types/telemetry.js";

export async function sendTelemetry(payload: TelemetryPayload): Promise<void> {
  if (!config.serverUrl.startsWith("https://")) {
    throw new Error("Only HTTPS endpoints are allowed");
  }

  await axios.post(`${config.serverUrl}/api/telemetry/antivirus`, payload, {
    headers: {
      "x-agent-key": config.apiKey,
    },
  });
}
