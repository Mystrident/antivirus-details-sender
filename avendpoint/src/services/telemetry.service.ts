console.log("loaded telemetry");

import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getEndpointMetadata } from "../collectors/endpoint.js";
import { getInstallerConfig } from "../collectors/installer-config.js";
import type { TelemetryPayload } from "../types/telemetry.js";

export async function buildTelemetryPayload(): Promise<TelemetryPayload> {
  const antivirus = await getAntivirusInfo();

  const endpoint = await getEndpointMetadata();

  const installer = await getInstallerConfig();

  return {
    hostname: endpoint.hostname,

    osName: endpoint.osName,

    macAddress: endpoint.macAddress,

    username: endpoint.username,

    assetId: installer.assetId,

    location: installer.location,

    antivirus,

    collectedAt: new Date().toISOString(),
  };
}
