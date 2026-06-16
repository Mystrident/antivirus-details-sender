import os from "os";

export interface EndpointMetadata {
  hostname: string;

  osName: string;

  macAddress: string | null;

  username: string | null;
}

export function getMacAddress(): string | null {
  const interfaces = os.networkInterfaces();

  const candidates: string[] = [];

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;

    for (const item of iface) {
      if (item.internal || !item.mac || item.mac === "00:00:00:00:00:00") {
        continue;
      }

      candidates.push(item.mac.toUpperCase());
    }
  }

  candidates.sort();

  return candidates[0] ?? null;
}

export async function getEndpointMetadata(): Promise<EndpointMetadata> {
  return {
    hostname: os.hostname(),

    osName: `${os.platform()} ${os.release()}`,

    macAddress: getMacAddress(),

    username: os.userInfo().username,
  };
}
