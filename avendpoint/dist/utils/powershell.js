import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export async function runPowerShell(command) {
    const { stdout } = await execAsync(`powershell "${command}"`);
    return stdout.trim();
}
