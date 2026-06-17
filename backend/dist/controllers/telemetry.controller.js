import { telemetrySchema } from "../validators/telemetry.validator.js";
import { upsertAVStat } from "../repositories/avstat.repository.js";
import { syncExpiryAlert } from "../services/expiry-alert.service.js";
import { syncScanAlert } from "../services/scan-alert.service.js";
export async function receiveTelemetry(req, res) {
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
}
