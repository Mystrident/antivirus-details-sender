import schedule from 'node-schedule';
import { sendScheduledTelemetry } from '../services/friday-telemetry.service.js';
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

    logger.info("Telemetry uploaded successfully");
  } catch (error) {
    logger.error({ err: error }, 'Heartbeat failed');
  }
}

export function startScheduler() {
  logger.info("Periodic telemetry scheduler started");

  sendScheduledTelemetry();

  schedule.scheduleJob(SCHEDULES.HOURLY, async () => {
    await sendScheduledTelemetry();
  });
}

export { sendHeartbeat };
