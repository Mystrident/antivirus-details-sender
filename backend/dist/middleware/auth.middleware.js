export function verifyAgent(req, res, next) {
    const apiKey = req.header("x-agent-key");
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "Missing API key",
        });
    }
    if (apiKey !== process.env.AGENT_API_KEY) {
        return res.status(401).json({
            success: false,
            message: "Invalid API key",
        });
    }
    next();
}
