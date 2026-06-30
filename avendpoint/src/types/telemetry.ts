export interface TelemetryPayload {
  assetId: string;

  location: string;

  macAddress: string | null;

  platform:string,

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    lastScan: string | null;

    expiryDate: string | null;
  };

  collectedAt: string;
}
