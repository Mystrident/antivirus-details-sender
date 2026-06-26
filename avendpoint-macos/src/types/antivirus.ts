import type { TelemetryPayload } from './telemetry.js';

export interface AntivirusProduct {
  displayName: string;
  productState: number;
}

export interface NortonMetrics {
  productName: string | null;
  version: string | null;
  enabled: boolean;
  lastScan: string | null;
  expiryDate: string | null;
}

export type AntivirusInfo = TelemetryPayload['antivirus'];
