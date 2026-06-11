export interface TelemetryPayload {
  hostname: string;
  osName: string;

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    signatureVersion: string | null;

    lastUpdateTime: string | null;

    filesScanned: number | null;

    threatsDetected: number | null;

    threatsResolved: number | null;

    quarantineCount: number;

    lastThreatDetection: string | null;

    lastProtectionEvent: string | null;

    lastScan: string | null;

    expiryDate: string | null;

    needsUpdate: boolean | null;
  };

  collectedAt: string;
}
