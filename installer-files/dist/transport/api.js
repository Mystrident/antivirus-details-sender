import axios from "axios";
import { config } from "../config/config.js";
export async function sendTelemetry(payload) {
    await axios.post(`${config.serverUrl}/api/telemetry/antivirus`, payload);
}
