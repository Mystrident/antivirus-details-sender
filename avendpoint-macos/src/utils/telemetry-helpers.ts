import type { TelemetryPayload } from '../types/telemetry.js';

export type AntivirusInfo = TelemetryPayload['antivirus'];

export function createAntivirusPayload(info: AntivirusInfo): AntivirusInfo {
  return {
    productName: info.productName,
    version: info.version,
    enabled: info.enabled,
    lastScan: info.lastScan,
    expiryDate: info.expiryDate,
  };
}
