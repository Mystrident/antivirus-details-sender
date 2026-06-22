console.log("mcafee db");

import fs from "fs"; // fs is a built-in Node.js module for file system operations
import path from "path"; // path is a built-in Node.js module for handling and transforming file paths

export interface McAfeeMetrics {
  lastScan: string | null;
  expiryDate: string | null;
} // Define an interface for McAfee metrics, which includes the last scan date and the expiry date, both of which can be either a string or null.

function getSortedEtlFiles(): string[] {
  const logDir = "C:\\ProgramData\\McAfee\\wps\\log";

  try {
    return fs
      .readdirSync(logDir)
      .filter((f) => f.startsWith("wps-") && f.endsWith(".etl"))
      .map((f) => ({
        path: path.join(logDir, f),
        time: fs.statSync(path.join(logDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.time - a.time)
      .map((f) => f.path);
  } catch {
    return [];
  }
} // define a function to get sorted etl files from mcafee log directory. it reads the directory, filters for files that start with "wps-" and end with ".etl", maps them to an object containing the file path and modification time, sorts them by modification time in descending order, and returns an array of file paths. if an error occurs (e.g., the directory doesn't exist), it returns an empty array. etl files are event trace log files used by Windows for logging events, and in this case, they are used by McAfee to log antivirus events.

function getMcAfeeLastScan(): string | null {
  const files = getSortedEtlFiles(); // get the sorted etl files from mcafee log directory

  for (const file of files) { // iterate over each file in the sorted etl files
    try {
      const content = fs.readFileSync(file, "utf8"); // read the content of the file synchronously and store it in a variable called content. the encoding is set to "utf8" to read the file as a string.

      const match = content.match(/Formatting timestamp:\s*(\d+)/); // use a regular expression to search for the last scan timestamp in the content of the file. the regular expression looks for the string "Formatting timestamp:" followed by one or more digits, and captures the digits in a group.

      if (match) {
        const unixTimestamp = Number(match[1]); // match[1] means the first captured group in the regular expression, which is the last scan timestamp in seconds since the Unix epoch. convert it to a number and store it in a variable called unixTimestamp.

        const scanDate = new Date(unixTimestamp * 1000);

        if (!isNaN(scanDate.getTime())) {
          console.log("McAfee Last Scan:", scanDate.toISOString());

          return scanDate.toISOString();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return null;
}

function getMcAfeeExpiryDate(): string | null {
  const files = getSortedEtlFiles();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      const match = content.match(/"expiryTime":(\d+)/);

      if (match) {
        console.log(
          "McAfee Expiry Date:",
          new Date(Number(match[1])).toISOString(),
        );
        return new Date(Number(match[1])).toISOString();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return null;
}

export async function getMcAfeeMetrics(): Promise<McAfeeMetrics> {
  return {
    lastScan: getMcAfeeLastScan(),
    expiryDate: getMcAfeeExpiryDate(),
  };
}
