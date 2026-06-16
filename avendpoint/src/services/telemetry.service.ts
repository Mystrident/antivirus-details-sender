console.log("loaded telemetry");

import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getSystemInfo } from "../collectors/system.js";
import type { TelemetryPayload } from "../types/telemetry.js";

export async function buildTelemetryPayload(): Promise<TelemetryPayload> {
  const antivirus = await getAntivirusInfo();
  const system = await getSystemInfo();

  return {
    hostname: system.hostname,
    osName: system.osName,
    antivirus,
    collectedAt: new Date().toISOString(),
  };
}
