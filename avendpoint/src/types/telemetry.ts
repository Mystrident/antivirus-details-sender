import type { AntivirusInfo } from "./antivirus.js";

export interface TelemetryPayload {
  hostname: string;
  osName: string;
  antivirus: AntivirusInfo; // whole information about antivirus, including product name, version, enabled status, last scan date, expiry date, update requirement, and quarantine count
  collectedAt: string;
}
