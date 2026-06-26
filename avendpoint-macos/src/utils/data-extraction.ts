export function extractTimestampFromContent(
  content: string,
  pattern: RegExp,
): string | null {
  const match = content.match(pattern);
  if (!match) return null;

  const raw = match[1];
  const timestamp = Number(raw);

  if (Number.isNaN(timestamp) || timestamp <= 0) {
    return null;
  }

  let millis: number;

  if (timestamp > 1e15) {
    // microseconds
    millis = Math.floor(timestamp / 1000);
  } else if (timestamp > 1e12) {
    // milliseconds
    millis = timestamp;
  } else {
    // seconds
    millis = timestamp * 1000;
  }

  const date = new Date(millis);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function extractAndParseDate(
  value: string | number,
  isUnixSeconds: boolean = true,
): string | null {
  try {
    const numValue = typeof value === 'string' ? Number(value) : value;

    if (Number.isNaN(numValue) || numValue <= 0) {
      return null;
    }

    const timestamp = isUnixSeconds ? numValue * 1000 : numValue;
    return new Date(timestamp).toISOString();
  } catch {
    return null;
  }
}
