import { telemetrySchema } from "../validators/telemetry.validator.js";
import { upsertAVStat } from "../repositories/avstat.repository.js";
import { syncExpiryAlert } from "../services/expiry-alert.service.js";
import { syncScanAlert } from "../services/scan-alert.service.js";
import { Request, Response } from "express";
import { logger } from "../logger.js";

export async function receiveTelemetry(req: Request, res: Response) {
  try {
    const validation = telemetrySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.error.issues,
      });
    }

    const stat = await upsertAVStat(validation.data);

    await syncScanAlert(stat);

    await syncExpiryAlert(stat);

    return res.status(200).json({
      success: true,
      message: "Telemetry processed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
