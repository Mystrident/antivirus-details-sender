import fs from "fs";
const CONFIG_PATH = "C:\\ProgramData\\EndpointAgent\\config.json";
export function getAgentConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        throw new Error(`Missing config file: ${CONFIG_PATH}`);
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}
export function saveAgentConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
