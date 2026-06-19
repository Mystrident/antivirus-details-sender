import { prisma } from "../prisma.js";

//these functions are used to get all the scan alerts and expiry alerts present in their respctive tables in the database.

export async function getScanAlerts() {
  return prisma.aVScanAlert.findMany();
}

export async function getExpiryAlerts() {
  return prisma.aVExpiryAlert.findMany();
}
