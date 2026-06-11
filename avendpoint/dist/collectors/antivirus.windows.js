import { runPowerShell } from "../utils/powershell.js";
import { collectMcAfee } from "./vendors/mcafee.collector.js";
import { collectNorton } from "./vendors/norton.collector.js";
import { collectGenericAntivirus } from "./vendors/generic.collector.js";
export async function getWindowsAntivirusInfo() {
    try {
        const command = "Get-CimInstance -Namespace root/SecurityCenter2 -Class AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json";
        const output = await runPowerShell(command);
        const data = JSON.parse(output);
        const antivirus = Array.isArray(data)
            ? (data.find((av) => !av.displayName.toLowerCase().includes("defender")) ?? data[0])
            : data;
        const name = antivirus.displayName.toLowerCase();
        if (name.includes("mcafee")) {
            return collectMcAfee(antivirus);
        }
        if (name.includes("norton")) {
            return collectNorton(antivirus);
        }
        return collectGenericAntivirus(antivirus);
    }
    catch (error) {
        console.error("Failed to collect antivirus info:", error);
        return {
            productName: "Unknown",
            version: null,
            enabled: false,
            signatureVersion: null,
            lastUpdateTime: null,
            quarantineCount: 0,
            lastThreatDetection: null,
            lastScan: null,
            expiryDate: null,
            needsUpdate: null,
            filesScanned: null,
            lastProtectionEvent: null,
            threatsDetected: null,
            threatsResolved: null,
        };
    }
}
