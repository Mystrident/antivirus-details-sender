import os from 'os';
import { execSync } from 'child_process';
import type { EndpointMetadata } from '../types/endpoint.js';
import { logger } from '../logger.js';

// ─── OS info ─────────────────────────────────────────────────────────────────

function runSwVers(flag: string): string | null {
  try {
    return execSync(`sw_vers ${flag}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    logger.debug({ err }, `sw_vers ${flag} failed`);
    return null;
  }
}

function getMacOSName(): string {
  const productName    = runSwVers('-productName');
  const productVersion = runSwVers('-productVersion');

  if (productName && productVersion) {
    return `${productName} ${productVersion}`;
  }

  // Fallback: mirrors Windows os.platform() + os.release() pattern
  return `${os.platform()} ${os.release()}`;
}

// ─── MAC address ─────────────────────────────────────────────────────────────

/**
 * Primary strategy: parse `networksetup -listallhardwareports`.
 *
 * Output format:
 *   Hardware Port: Wi-Fi
 *   Device: en0
 *   Ethernet Address: a4:83:e7:xx:xx:xx
 *
 * We locate the Wi-Fi block first, then fall through to the first non-null
 * address on any active interface if Wi-Fi is absent.
 */
function getMacAddressFromNetworksetup(): string | null {
  try {
    const output = execSync('networksetup -listallhardwareports', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Split into per-interface blocks separated by blank lines
    const blocks = output.split(/\n\s*\n/).filter(Boolean);

    const ethernetAddressPattern = /Ethernet Address:\s*([0-9a-fA-F:]{17})/;
    const nullMac = '00:00:00:00:00:00';

    let wifiAddress:    string | null = null;
    let fallbackAddress: string | null = null;

    for (const block of blocks) {
      const isWifi   = /Hardware Port:\s*Wi-Fi/i.test(block);
      const addrMatch = ethernetAddressPattern.exec(block);

      if (!addrMatch) continue;

      const mac = addrMatch[1].toUpperCase();
      if (mac === nullMac.toUpperCase()) continue;

      if (isWifi) {
        wifiAddress = mac;
        break; // Wi-Fi is preferred; stop immediately
      }

      if (!fallbackAddress) {
        fallbackAddress = mac;
      }
    }

    return wifiAddress ?? fallbackAddress;
  } catch (err) {
    logger.debug({ err }, 'networksetup -listallhardwareports failed');
    return null;
  }
}

/**
 * Fallback strategy: parse `ifconfig en0`.
 *
 * Looks for a line of the form:
 *   ether xx:xx:xx:xx:xx:xx
 */
function getMacAddressFromIfconfig(): string | null {
  try {
    const output = execSync('ifconfig en0', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const match = /\bether\s+([0-9a-fA-F:]{17})\b/.exec(output);
    if (!match) return null;

    const mac = match[1].toUpperCase();
    return mac !== '00:00:00:00:00:00' ? mac : null;
  } catch (err) {
    logger.debug({ err }, 'ifconfig en0 failed');
    return null;
  }
}

export function getMacAddress(): string | null {
  return getMacAddressFromNetworksetup() ?? getMacAddressFromIfconfig();
}

// ─── Public API ───────────────────────────────────────────────────────────────



export async function getEndpointMetadata(): Promise<EndpointMetadata> {
  const macAddress = getMacAddress();

  if (!macAddress) {
    throw new Error("Unable to determine MAC address");
  }

  return {
    hostname: os.hostname(),
    osName:     getMacOSName(),
    macAddress,
    username: os.userInfo().username,
  };
}

