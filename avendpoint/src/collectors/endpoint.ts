import os from "os";

export interface EndpointMetadata {
  hostname: string;

  osName: string;

  macAddress: string | null;

  username: string | null;
}

function getMacAddress(): string | null {
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;

    for (const adapter of iface) {
      if (
        !adapter.internal &&
        adapter.mac &&
        adapter.mac !== "00:00:00:00:00:00"
      ) {
        return adapter.mac.toUpperCase();
      }
    }
  }

  return null;
}

export async function getEndpointMetadata(): Promise<EndpointMetadata> {
  return {
    hostname: os.hostname(),

    osName: `${os.platform()} ${os.release()}`,

    macAddress: getMacAddress(),

    username: os.userInfo().username,
  };
}
