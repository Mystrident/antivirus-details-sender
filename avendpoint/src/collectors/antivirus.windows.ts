import type { AntivirusInfo } from "../types/antivirus.js";
import { runPowerShell } from "../utils/powershell.js";

interface AntivirusProduct {
  displayName: string;
  productState: number;
}

function isEnabled(productState: number): boolean {
  return productState !== 0;
}

export async function getWindowsAntivirusInfo(): Promise<AntivirusInfo> {
  try {
    const command =
      "Get-CimInstance -Namespace root/SecurityCenter2 -Class AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json";

    const output = await runPowerShell(command);

    const data = JSON.parse(output);

    const antivirus: AntivirusProduct = Array.isArray(data) ? data[0] : data;

    return {
      productName: antivirus.displayName,
      version: null,
      enabled: isEnabled(antivirus.productState),
      lastScan: null,
      expiryDate: null,
      needsUpdate: null,
    };
  } catch (error) {
    console.error("Failed to collect antivirus info:", error);

    return {
      productName: "Unknown",
      version: null,
      enabled: false,
      lastScan: null,
      expiryDate: null,
      needsUpdate: null,
    };
  }
}
