import { Router } from "express";

import { verifyAgent } from "../middleware/auth.middleware.js";

import {
  receiveTelemetry,
  fetchEndpoints,
} from "../controllers/telemetry.controller.js";

const router = Router();

router.post("/antivirus", verifyAgent, receiveTelemetry);
router.get("/endpoints", fetchEndpoints);
export default router;
