import { getScanAlerts } from "./report.service.js";
import { createCsv } from "./csv.service.js";
export async function generateScanCsv() {
    const records = await getScanAlerts();
    const today = new Date().toISOString().split("T")[0];
    return createCsv(`./reports/archive/scan-alerts-${today}.csv`, [
        { id: "assetId", title: "Asset ID" },
        { id: "location", title: "Location" },
        { id: "macAddress", title: "MAC Address" },
        { id: "lastScanDate", title: "Last Scan Date" },
    ], records);
}
