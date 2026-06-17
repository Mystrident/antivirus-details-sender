console.log("mcafee db");
import fs from "fs";
import path from "path";
function getSortedEtlFiles() {
    const logDir = "C:\\ProgramData\\McAfee\\wps\\log";
    try {
        return fs
            .readdirSync(logDir)
            .filter((f) => f.startsWith("wps-") && f.endsWith(".etl"))
            .map((f) => ({
            path: path.join(logDir, f),
            time: fs.statSync(path.join(logDir, f)).mtimeMs,
        }))
            .sort((a, b) => b.time - a.time)
            .map((f) => f.path);
    }
    catch {
        return [];
    }
}
function getMcAfeeLastScan() {
    const files = getSortedEtlFiles();
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, "utf8");
            const match = content.match(/Formatting timestamp:\s*(\d+)/);
            if (match) {
                const unixTimestamp = Number(match[1]);
                const scanDate = new Date(unixTimestamp * 1000);
                if (!isNaN(scanDate.getTime())) {
                    console.log("McAfee Last Scan:", scanDate.toISOString());
                    return scanDate.toISOString();
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    return null;
}
function getMcAfeeExpiryDate() {
    const files = getSortedEtlFiles();
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, "utf8");
            const match = content.match(/"expiryTime":(\d+)/);
            if (match) {
                console.log("McAfee Expiry Date:", new Date(Number(match[1])).toISOString());
                return new Date(Number(match[1])).toISOString();
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    return null;
}
export async function getMcAfeeMetrics() {
    return {
        lastScan: getMcAfeeLastScan(),
        expiryDate: getMcAfeeExpiryDate(),
    };
}
