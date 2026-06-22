import { TelemetryPayload } from "../../types/telemetry.js";
import { getMcAfeeMetrics } from "./mcafee.db.js";
import Registry from "winreg"; // Import the winreg module to access the Windows registry for retrieving McAfee version information.

function getMcAfeeVersion(): Promise<string | null> {
  // define a function to get the McAfee version from the Windows registry. it returns a promise that resolves to a string (the version) or null if the version cannot be retrieved.
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKLM, // specify the registry hive (HKEY_LOCAL_MACHINE) to access the McAfee version information.
      key: "\\SOFTWARE\\McAfee\\wps", // specify the registry key path where the McAfee version information is stored.
    });

    regKey.get("Version", (err, item) => {
      if (err || !item) {
        resolve(null);
      } else {
        resolve(item.value.trim()); // resolve the promise with the trimmed version string retrieved from the registry.
      }
    });
  });
}

export async function collectMcAfee(
  product: any,
): Promise<TelemetryPayload["antivirus"]> {
  // define an asynchronous function to collect McAfee antivirus information. it takes a product object as input and returns a promise that resolves to the antivirus telemetry payload. "antivirus" is a property of the TelemetryPayload interface, which contains information about the antivirus product, such as its name, version, enabled status, last scan date, and expiry date.
  const version = await getMcAfeeVersion();
  const metrics = await getMcAfeeMetrics();

  return {
    productName: product.displayName,
    version,
    enabled: product.productState !== 0,

    lastScan: metrics.lastScan,
    expiryDate: metrics.expiryDate,
  };
}
