export interface AntivirusInfo {
  productName: string;

  version: string | null;

  enabled: boolean;

  signatureVersion: string | null;

  lastUpdateTime: string | null;

  quarantineCount: number;

  lastThreatDetection: string | null;

  filesScanned: number | null;

  lastProtectionEvent: string | null;

  lastScan: string | null;

  expiryDate: string | null;

  needsUpdate: boolean | null;

  threatsDetected: number | null;
  threatsResolved: number | null;
}
