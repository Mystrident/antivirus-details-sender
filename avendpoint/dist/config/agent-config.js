import fs from 'fs';
import { WINDOWS_PATHS } from './constants.js';
export function getAgentConfig() {
    if (!fs.existsSync(WINDOWS_PATHS.CONFIG)) {
        throw new Error(`Missing config file: ${WINDOWS_PATHS.CONFIG}`);
    }
    return JSON.parse(fs.readFileSync(WINDOWS_PATHS.CONFIG, 'utf8'));
}
export function saveAgentConfig(config) {
    fs.writeFileSync(WINDOWS_PATHS.CONFIG, JSON.stringify(config, null, 2));
}
