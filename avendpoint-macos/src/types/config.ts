export interface AgentConfig {
  serverUrl: string;
  apiKey: string;
  assetId: string;
  location: string;
  lastTelemetrySent: string | null;
}
