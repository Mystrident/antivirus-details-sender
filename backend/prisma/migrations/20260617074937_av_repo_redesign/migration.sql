/*
  Warnings:

  - You are about to drop the `Antivirus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Endpoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Antivirus" DROP CONSTRAINT "Antivirus_endpointId_fkey";

-- DropTable
DROP TABLE "Antivirus";

-- DropTable
DROP TABLE "Endpoint";

-- CreateTable
CREATE TABLE "AVStatRepo" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "osName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "version" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "lastScanDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "lastTelemetryReceived" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AVStatRepo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AVScanAlert" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lastScanDate" TIMESTAMP(3),
    "alertCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AVScanAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AVExpiryAlert" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "alertCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AVExpiryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AVStatRepo_assetId_key" ON "AVStatRepo"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AVStatRepo_macAddress_key" ON "AVStatRepo"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AVScanAlert_assetId_key" ON "AVScanAlert"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AVExpiryAlert_assetId_key" ON "AVExpiryAlert"("assetId");
