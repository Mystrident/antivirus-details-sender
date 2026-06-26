import type { TelemetryPayload } from '../types/telemetry.js';

export async function getMockAntivirusInfo(): Promise<TelemetryPayload['antivirus']> {
  return {
    productName: 'Invalid OS',
    version:     '0',
    enabled:     false,
    lastScan:    null,
    expiryDate:  null,
  };
}
