import { createObjectCsvWriter } from "csv-writer";

export async function createCsv(path: string, headers: any[], records: any[]) {
  const writer = createObjectCsvWriter({
    path,
    header: headers,
  });

  await writer.writeRecords(records);

  return path;
}
