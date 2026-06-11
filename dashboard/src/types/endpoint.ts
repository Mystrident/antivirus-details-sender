export interface Endpoint {
  id: string;

  hostname: string;

  osName: string;

  status: string;

  lastSeen: string;

  antivirus: {
    productName: string;

    version: string | null;

    enabled: boolean;

    needsUpdate: boolean | null;

    filesScanned: number | null;

    threatsDetected: number | null;

    threatsResolved: number | null;

    quarantineCount: number;

    lastProtectionEvent: string | null;
  } | null;
}
