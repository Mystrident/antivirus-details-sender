console.log("loaded telemetry");
import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getEndpointMetadata } from "../collectors/endpoint.js";
import { getInstallerConfig } from "../collectors/installer-config.js";
export async function buildTelemetryPayload() {
    const antivirus = await getAntivirusInfo();
    const endpoint = await getEndpointMetadata();
    const installer = await getInstallerConfig();
    return {
        hostname: endpoint.hostname,
        osName: endpoint.osName,
        macAddress: endpoint.macAddress,
        username: installer.username,
        assetId: installer.assetId,
        location: installer.location,
        antivirus,
        collectedAt: new Date().toISOString(),
    };
}
