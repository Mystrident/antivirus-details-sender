export interface TelemetryPayload {
  hostname: string;

  osName: string;

  macAddress: string | null;

  username: string | null;

  assetId: string | null;

  location: string | null;

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    lastScan: string | null;

    expiryDate: string | null;
  };

  collectedAt: string;
}
