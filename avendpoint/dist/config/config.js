function validateConfig() {
    const serverUrl = process.env.SERVER_URL?.trim();
    const apiKey = process.env.AGENT_API_KEY?.trim();
    if (!serverUrl) {
        throw new Error('Environment variable SERVER_URL is required');
    }
    if (!apiKey) {
        throw new Error('Environment variable AGENT_API_KEY is required');
    }
    if (!serverUrl.startsWith('https://')) {
        throw new Error('SERVER_URL must start with https://');
    }
    return { serverUrl, apiKey };
}
export const config = validateConfig();
