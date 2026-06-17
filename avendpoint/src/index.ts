import "dotenv/config";

import { startScheduler, sendHeartbeat } from "./scheduler/scheduler.js";

import { getAgentConfig } from "./config/agent-config.js";

async function bootstrap() {
  console.log("starting...");

  await sendHeartbeat();

  startScheduler();

  console.log("Agent running");
}

bootstrap().catch(console.error);

console.log(getAgentConfig());
