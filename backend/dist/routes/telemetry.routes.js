import { Router } from "express";
import { receiveTelemetry, fetchEndpoints, } from "../controllers/telemetry.controller.js";
const router = Router();
router.post("/antivirus", receiveTelemetry);
router.get("/endpoints", fetchEndpoints);
export default router;
