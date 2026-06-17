import fs from "fs";
import path from "path";

const CONFIG_PATH = "C:\\ProgramData\\EndpointAgent\\config.json";

export interface AgentConfig {
  serverUrl: string;
  apiKey: string;

  assetId: string;
  location: string;

  lastTelemetrySent: string | null;
}

export function getAgentConfig(): AgentConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config file: ${CONFIG_PATH}`);
  }

  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

export function saveAgentConfig(config: AgentConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
