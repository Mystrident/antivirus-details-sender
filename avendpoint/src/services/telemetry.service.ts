import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getEndpointMetadata } from "../collectors/endpoint.js";
import { getAgentConfig } from "../config/agent-config.js";
import type { TelemetryPayload } from "../types/telemetry.js";

export async function collectTelemetry(): Promise<TelemetryPayload> {
  const antivirus = await getAntivirusInfo();
  const config = getAgentConfig();
  const endpoint = await getEndpointMetadata();

  if (!endpoint.macAddress) {
    throw new Error("Unable to determine device MAC address");
  }
  return {
    assetId: config.assetId,

    location: config.location,

    macAddress: endpoint.macAddress,

    platform:endpoint.osName,

    antivirus,

    collectedAt: new Date().toISOString(),
  };
}
