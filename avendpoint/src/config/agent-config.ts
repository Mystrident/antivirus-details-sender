import fs from 'fs';
import type { AgentConfig } from '../types/config.js';
import { WINDOWS_PATHS } from './constants.js';

export function getAgentConfig(): AgentConfig {
  if (!fs.existsSync(WINDOWS_PATHS.CONFIG)) {
    throw new Error(`Missing config file: ${WINDOWS_PATHS.CONFIG}`);
  }

  return JSON.parse(fs.readFileSync(WINDOWS_PATHS.CONFIG, 'utf8'));
}

export function saveAgentConfig(config: AgentConfig) {
  fs.writeFileSync(WINDOWS_PATHS.CONFIG, JSON.stringify(config, null, 2));
}
