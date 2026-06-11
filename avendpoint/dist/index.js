import { startScheduler, sendHeartbeat } from "./scheduler/scheduler.js";
async function bootstrap() {
    await sendHeartbeat(); // immediate
    startScheduler(); // recurring
    console.log("Agent running");
}
bootstrap();
