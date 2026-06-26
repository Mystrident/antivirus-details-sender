import schedule from 'node-schedule';
import { sendFridayTelemetry } from '../services/friday-telemetry.service.js';
import { collectTelemetry } from '../services/telemetry.service.js';
import { sendTelemetry } from '../transport/api.js';
import { logger } from '../logger.js';
import { SCHEDULES } from '../config/constants.js';

async function sendHeartbeat() {
  try {
    const payload = await collectTelemetry();

    logger.debug(
      {
        assetId:  payload.assetId,
        location: payload.location,
      },
      'Telemetry collected',
    );

    await sendTelemetry(payload);

    logger.info('Heartbeat sent');
  } catch (error) {
    logger.error({ err: error }, 'Heartbeat failed');
  }
}

export function startScheduler() {
  logger.info('Friday scheduler started');

  sendFridayTelemetry();

  schedule.scheduleJob(SCHEDULES.HOURLY, async () => {
    await sendFridayTelemetry();
  });
}

export { sendHeartbeat };
