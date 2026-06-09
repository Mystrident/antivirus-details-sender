import { buildTelemetryPayload } from "./services/telemetry.service.js";
import { sendTelemetry } from "./transport/api.js";
async function main() {
    const payload = await buildTelemetryPayload();
    console.log("Sending:");
    console.log(JSON.stringify(payload, null, 2));
    await sendTelemetry(payload);
    console.log("Telemetry sent");
}
main().catch(console.error);
