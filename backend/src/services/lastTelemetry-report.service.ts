import { getLastTelemetryAlerts } from "./report.service.js";

import { createCsv } from "./csv.service.js";


export async function generateLastTelemetryCsv() {
  const records = await getLastTelemetryAlerts();

  const today = new Date().toISOString().split("T")[0];

  return createCsv(
    `./reports/archive/last-telemetry-alerts-${today}.csv`,

    [
      { id: "assetId", title: "Asset ID" },
      { id: "location", title: "Location" },
      { id: "platform", title: "Platform" },
      { id: "macAddress", title: "MAC Address" },
      { id: "lastTelemetryReceived", title: "Last Telemetry Received" },
    ],

    records,
  );
}