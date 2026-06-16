/*
  Warnings:

  - The primary key for the `Endpoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Endpoint` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Endpoint` table. All the data in the column will be lost.
  - The `id` column on the `Endpoint` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AntivirusInfo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[macAddress]` on the table `Endpoint` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `macAddress` to the `Endpoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AntivirusInfo" DROP CONSTRAINT "AntivirusInfo_endpointId_fkey";

-- DropIndex
DROP INDEX "Endpoint_hostname_key";

-- AlterTable
ALTER TABLE "Endpoint" DROP CONSTRAINT "Endpoint_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "macAddress" TEXT NOT NULL,
ADD COLUMN     "username" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "AntivirusInfo";

-- CreateTable
CREATE TABLE "Antivirus" (
    "id" SERIAL NOT NULL,
    "productName" TEXT NOT NULL,
    "version" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "lastScan" TEXT,
    "expiryDate" TIMESTAMP(3),
    "endpointId" INTEGER NOT NULL,

    CONSTRAINT "Antivirus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Antivirus_endpointId_key" ON "Antivirus"("endpointId");

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_macAddress_key" ON "Endpoint"("macAddress");

-- AddForeignKey
ALTER TABLE "Antivirus" ADD CONSTRAINT "Antivirus_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
