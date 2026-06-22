import "dotenv/config";

import { startScheduler, sendHeartbeat } from "./scheduler/scheduler.js";

import { getAgentConfig } from "./config/agent-config.js";

async function bootstrap() {
  await sendHeartbeat();

  startScheduler();
}

bootstrap().catch(console.error);

console.log(getAgentConfig());
