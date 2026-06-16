console.log("before import");
import { startScheduler, sendHeartbeat } from "./scheduler/scheduler.js";
async function bootstrap() {
    console.log("starting...");
    await sendHeartbeat();
    startScheduler();
    console.log("Agent running");
}
bootstrap().catch(console.error);
