import { Router } from "express";

import { verifyAgent } from "../middleware/auth.middleware.js";

import { receiveTelemetry } from "../controllers/telemetry.controller.js";

const router = Router();

router.post("/antivirus", verifyAgent, receiveTelemetry);

export default router;
