import axios from 'axios';
import { getAgentConfig } from '../config/agent-config.js';
import { logger } from '../logger.js';
import { API } from '../config/constants.js';
export async function sendTelemetry(payload) {
    const config = getAgentConfig();
    if (!config.serverUrl.startsWith(API.PROTOCOL)) {
        logger.error('Invalid server URL - only HTTPS endpoints are allowed');
        throw new Error('Only HTTPS endpoints are allowed');
    }
    try {
        await axios.post(`${config.serverUrl}${API.ENDPOINT_PATH}`, payload, {
            headers: {
                [API.HEADER_KEY]: config.apiKey,
            },
        });
        logger.debug('Telemetry sent successfully');
    }
    catch (error) {
        logger.error({ err: error }, 'Failed to send telemetry');
        throw error;
    }
}
