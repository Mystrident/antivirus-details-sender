import { createObjectCsvWriter } from "csv-writer";
import fs from "fs/promises";
import path from "path";

interface CsvHeader {
  id: string;
  title: string;
}

export async function createCsv(
  filePath: string,
  headers: CsvHeader[],
  records: Record<string, unknown>[],
) {

  // Ensure parent directory exists
  await fs.mkdir(
    path.dirname(filePath),
    { recursive: true },
  );

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await writer.writeRecords(records);

  return filePath;
}