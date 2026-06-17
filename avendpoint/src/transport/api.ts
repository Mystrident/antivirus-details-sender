import axios from "axios";
import { getAgentConfig } from "../config/agent-config.js";

export async function sendTelemetry(payload: any) {
  const config = await getAgentConfig();

  if (!config.serverUrl || !config.serverUrl.startsWith("https://")) {
    throw new Error("Only HTTPS endpoints are allowed");
  }

  await axios.post(`${config.serverUrl}/api/telemetry/antivirus`, payload, {
    headers: {
      "x-agent-key": config.apiKey,
    },
  });
}
