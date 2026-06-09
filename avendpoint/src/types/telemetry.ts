import type { AntivirusInfo } from "./antivirus.js";

export interface TelemetryPayload {
  hostname: string;
  osName: string;
  antivirus: AntivirusInfo;
  collectedAt: string;
}
