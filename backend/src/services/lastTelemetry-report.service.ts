import { getExpiryAlerts } from "./report.service.js";

import { createCsv } from "./csv.service.js";


export async function generateExpiryCsv() {
  const records = await getExpiryAlerts();

  const today = new Date().toISOString().split("T")[0];

  return createCsv(
    `./reports/archive/expiry-alerts-${today}.csv`,

    [
      { id: "assetId", title: "Asset ID" },
      { id: "location", title: "Location" },
      {id:"platform", title:"Platform"},
      { id: "macAddress", title: "MAC Address" },
      { id: "lastTelemetryReceived", title: "LastTelemetry" },
    ],

    records,
  );
}
