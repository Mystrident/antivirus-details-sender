export interface TelemetryPayload {
  hostname: string;
  osName: string;

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    quarantineCount: number;

    lastScan: string | null;

    expiryDate: string | null;

    needsUpdate: boolean | null;
  };

  collectedAt: string;
}
