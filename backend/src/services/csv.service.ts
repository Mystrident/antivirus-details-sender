import { createObjectCsvWriter } from "csv-writer";

interface CsvHeader {
  id: string;
  title: string;
}

export async function createCsv(
  path: string,
  headers: CsvHeader[],
  records: Record<string, unknown>[],
) {
  const writer = createObjectCsvWriter({
    path,
    header: headers,
  });

  await writer.writeRecords(records);

  return path;
}
