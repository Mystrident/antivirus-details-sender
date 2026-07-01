import os from "os";
import type { EndpointMetadata } from "../types/endpoint.js";

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
  const macAddress = getMacAddress();

  if (!macAddress) {
    throw new Error("Unable to determine MAC address");
  }

  return {
    hostname: os.hostname(),
    osName: `${os.platform()} ${os.release()}`,
    macAddress,
    username: os.userInfo().username,
  };
}

