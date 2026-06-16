import type { AntivirusInfo } from "./antivirus.js";

export interface TelemetryPayload {
  hostname: string;

  osName: string;

  macAddress: string | null;

  username: string | null;

  assetId: string | null;

  location: string | null;

  antivirus: AntivirusInfo;

  collectedAt: string;
}
