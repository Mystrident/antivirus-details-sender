console.log("loaded antivirus.ts");
import os from "os";
import { getMockAntivirusInfo } from "./antivirus.mock.js";
import { getWindowsAntivirusInfo } from "./antivirus.windows.js";
export async function getAntivirusInfo() {
    if (os.platform() === "win32") {
        return getWindowsAntivirusInfo();
    }
    return getMockAntivirusInfo();
}
