import { createObjectCsvWriter } from "csv-writer";
export async function createCsv(path, headers, records) {
    const writer = createObjectCsvWriter({
        path,
        header: headers,
    });
    await writer.writeRecords(records);
    return path;
}
