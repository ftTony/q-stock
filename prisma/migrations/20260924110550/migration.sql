-- CreateEnum
CREATE TYPE "MarketCredentialProvider" AS ENUM ('longbridge', 'futu');

-- CreateTable
CREATE TABLE "UserMarketCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "MarketCredentialProvider" NOT NULL,
    "payload" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMarketCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserMarketCredential_userId_idx" ON "UserMarketCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMarketCredential_userId_provider_key" ON "UserMarketCredential"("userId", "provider");

-- AddForeignKey
ALTER TABLE "UserMarketCredential" ADD CONSTRAINT "UserMarketCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
