export interface TelemetryPayload {
  assetId: string;

  location: string;

  macAddress: string | null;

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    lastScan: string | null;

    expiryDate: string | null;
  };

  collectedAt: string;
}
