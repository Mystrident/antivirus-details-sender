/*
  Warnings:

  - Added the required column `platform` to the `AVExpiryAlert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `AVScanAlert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `AVStatRepo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AVExpiryAlert" ADD COLUMN     "platform" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AVScanAlert" ADD COLUMN     "platform" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AVStatRepo" ADD COLUMN     "platform" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AVLastTelemetryAlert" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "lastTelemetryReceived" TIMESTAMP(3) NOT NULL,
    "alertCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AVLastTelemetryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AVLastTelemetryAlert_location_assetId_key" ON "AVLastTelemetryAlert"("location", "assetId");
