import axios from "axios";
import { config } from "../config/config.js";
import type { TelemetryPayload } from "../types/telemetry.js";

export async function sendTelemetry(payload: TelemetryPayload): Promise<void> {
  await axios.post(`${config.serverUrl}/api/telemetry/antivirus`, payload);
}
