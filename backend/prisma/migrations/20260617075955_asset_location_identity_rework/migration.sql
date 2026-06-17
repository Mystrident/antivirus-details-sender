/*
  Warnings:

  - You are about to drop the column `username` on the `AVExpiryAlert` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `AVScanAlert` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `AVStatRepo` table. All the data in the column will be lost.
  - You are about to drop the column `hostname` on the `AVStatRepo` table. All the data in the column will be lost.
  - You are about to drop the column `osName` on the `AVStatRepo` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `AVStatRepo` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `AVStatRepo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[location,assetId]` on the table `AVExpiryAlert` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[location,assetId]` on the table `AVScanAlert` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[location,assetId]` on the table `AVStatRepo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `avInstalled` to the `AVStatRepo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AVExpiryAlert_assetId_key";

-- DropIndex
DROP INDEX "AVScanAlert_assetId_key";

-- DropIndex
DROP INDEX "AVStatRepo_assetId_key";

-- DropIndex
DROP INDEX "AVStatRepo_macAddress_key";

-- AlterTable
ALTER TABLE "AVExpiryAlert" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "AVScanAlert" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "AVStatRepo" DROP COLUMN "enabled",
DROP COLUMN "hostname",
DROP COLUMN "osName",
DROP COLUMN "productName",
DROP COLUMN "username",
ADD COLUMN     "avInstalled" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AVExpiryAlert_location_assetId_key" ON "AVExpiryAlert"("location", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AVScanAlert_location_assetId_key" ON "AVScanAlert"("location", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AVStatRepo_location_assetId_key" ON "AVStatRepo"("location", "assetId");
