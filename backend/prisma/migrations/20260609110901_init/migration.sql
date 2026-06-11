-- CreateTable
CREATE TABLE "Endpoint" (
    "id" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "osName" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntivirusInfo" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "version" TEXT,
    "enabled" BOOLEAN NOT NULL,
    "lastScan" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "needsUpdate" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AntivirusInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Endpoint_hostname_key" ON "Endpoint"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "AntivirusInfo_endpointId_key" ON "AntivirusInfo"("endpointId");

-- AddForeignKey
ALTER TABLE "AntivirusInfo" ADD CONSTRAINT "AntivirusInfo_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "Endpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
