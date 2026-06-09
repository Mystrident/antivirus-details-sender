import { upsertEndpoint } from "../repositories/endpoint.repository.js";
import { getAllEndpoints } from "../repositories/endpoint.repository.js";
export async function receiveTelemetry(req, res) {
    await upsertEndpoint(req.body);
    res.json({
        success: true,
    });
}
export async function fetchEndpoints(req, res) {
    try {
        const endpoints = await getAllEndpoints();
        const result = endpoints.map((endpoint) => {
            const diff = Date.now() - new Date(endpoint.lastSeen).getTime();
            return {
                ...endpoint,
                status: diff < 15 * 60 * 1000 ? "ONLINE" : "OFFLINE",
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
        });
    }
}
