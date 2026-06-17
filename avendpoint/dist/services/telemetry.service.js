console.log("loaded telemetry");
import { getAntivirusInfo } from "../collectors/antivirus.js";
import { getEndpointMetadata } from "../collectors/endpoint.js";
import { getAgentConfig } from "../config/agent-config.js";
export async function buildTelemetryPayload() {
    const antivirus = await getAntivirusInfo();
    const config = getAgentConfig();
    const endpoint = await getEndpointMetadata();
    return {
        assetId: config.assetId,
        location: config.location,
        macAddress: endpoint.macAddress,
        antivirus,
        collectedAt: new Date().toISOString(),
    };
}
