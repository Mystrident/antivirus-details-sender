console.log("loaded telemetry");
import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getSystemInfo } from "../collectors/system.js";
export async function buildTelemetryPayload() {
    const antivirus = await getAntivirusInfo();
    const system = await getSystemInfo();
    return {
        hostname: system.hostname,
        osName: system.osName,
        antivirus,
        collectedAt: new Date().toISOString(),
    };
}
