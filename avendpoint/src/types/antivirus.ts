export interface AntivirusInfo {
  productName: string;

  version: string | null;

  enabled: boolean;

  lastScan: string | null;

  expiryDate: string | null;

  needsUpdate: boolean | null;

  quarantineCount: number;
}
