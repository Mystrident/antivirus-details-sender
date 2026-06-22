import os from "os";
export function getMacAddress() {
    const interfaces = os.networkInterfaces();
    const candidates = [];
    for (const iface of Object.values(interfaces)) {
        if (!iface)
            continue;
        for (const item of iface) {
            if (item.internal || !item.mac || item.mac === "00:00:00:00:00:00") {
                continue;
            }
            candidates.push(item.mac.toUpperCase());
        }
    }
    candidates.sort();
    return candidates[0] ?? null;
}
export async function getEndpointMetadata() {
    const macAddress = getMacAddress();
    if (!macAddress) {
        throw new Error("Unable to determine MAC address");
    }
    return {
        hostname: os.hostname(),
        osName: `${os.platform()} ${os.release()}`,
        macAddress: getMacAddress(),
        username: os.userInfo().username,
    };
}
