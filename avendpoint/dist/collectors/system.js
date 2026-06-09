import os from "os";
export async function getSystemInfo() {
    return {
        hostname: os.hostname(),
        osName: `${os.platform()} ${os.release()}`,
    };
}
