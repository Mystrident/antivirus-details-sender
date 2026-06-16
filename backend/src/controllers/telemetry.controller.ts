import { upsertEndpoint } from "../repositories/endpoint.repository.js";
import { getAllEndpoints } from "../repositories/endpoint.repository.js";
import { telemetrySchema } from "../validators/telemetry.validator.js";

export async function receiveTelemetry(req: any, res: any) {
  const validation = telemetrySchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      errors: validation.error.issues,
    });
  }

  await upsertEndpoint(validation.data);

  res.json({
    success: true,
  });
}

export async function fetchEndpoints(req: any, res: any) {
  try {
    const endpoints = await getAllEndpoints();

    const result = endpoints.map((endpoint: any) => {
      const diff = Date.now() - new Date(endpoint.lastSeen).getTime();

      return {
        ...endpoint,
        status: diff < 15 * 60 * 1000 ? "ONLINE" : "OFFLINE",
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
}
