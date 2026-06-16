import { getInstallerConfig } from "../collectors/installer-config.js";

export async function getRuntimeConfig() {
  const config = await getInstallerConfig();

  if (!config.serverUrl) {
    throw new Error("ServerUrl missing from registry");
  }

  if (!config.apiKey) {
    throw new Error("ApiKey missing from registry");
  }

  return config;
}
