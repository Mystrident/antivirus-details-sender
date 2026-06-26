import fs from 'fs';
import type { AgentConfig } from '../types/config.js';
import { MACOS_PATHS } from './constants.js';

export function getAgentConfig(): AgentConfig {
  if (!fs.existsSync(MACOS_PATHS.CONFIG)) {
    throw new Error(`Missing config file: ${MACOS_PATHS.CONFIG}`);
  }

  return JSON.parse(fs.readFileSync(MACOS_PATHS.CONFIG, 'utf8'));
}

export function saveAgentConfig(config: AgentConfig) {
  fs.writeFileSync(MACOS_PATHS.CONFIG, JSON.stringify(config, null, 2));
}
