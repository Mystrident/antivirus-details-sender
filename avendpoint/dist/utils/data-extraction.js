export function extractTimestampFromContent(content, pattern) {
    const match = content.match(pattern);
    if (!match)
        return null;
    const unixTimestamp = Number(match[1]);
    if (Number.isNaN(unixTimestamp))
        return null;
    try {
        return new Date(unixTimestamp * 1000).toISOString();
    }
    catch {
        return null;
    }
}
export function extractAndParseDate(value, isUnixSeconds = true) {
    try {
        const numValue = typeof value === 'string' ? Number(value) : value;
        if (Number.isNaN(numValue) || numValue <= 0) {
            return null;
        }
        const timestamp = isUnixSeconds ? numValue * 1000 : numValue;
        return new Date(timestamp).toISOString();
    }
    catch {
        return null;
    }
}
