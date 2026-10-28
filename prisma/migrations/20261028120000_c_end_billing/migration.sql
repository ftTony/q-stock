-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'pro');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN     "planExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN     "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN     "aiUsagePeriod" TEXT;
ALTER TABLE "User" ADD COLUMN     "aiPeriodUsageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- CreateTable
CREATE TABLE "ResearchCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "whyWatch" TEXT NOT NULL DEFAULT '',
    "question" TEXT NOT NULL DEFAULT '',
    "watchConditions" TEXT NOT NULL DEFAULT '',
    "risks" TEXT NOT NULL DEFAULT '',
    "reviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedeemCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL DEFAULT 'pro',
    "days" INTEGER NOT NULL DEFAULT 30,
    "maxRedemptions" INTEGER NOT NULL DEFAULT 1,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedeemCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedeemRedemption" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedeemRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntitlementGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL,
    "source" TEXT NOT NULL,
    "days" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntitlementGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResearchCard_userId_symbol_assetType_key" ON "ResearchCard"("userId", "symbol", "assetType");

-- CreateIndex
CREATE INDEX "ResearchCard_userId_updatedAt_idx" ON "ResearchCard"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RedeemCode_code_key" ON "RedeemCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RedeemRedemption_codeId_userId_key" ON "RedeemRedemption"("codeId", "userId");

-- CreateIndex
CREATE INDEX "RedeemRedemption_userId_idx" ON "RedeemRedemption"("userId");

-- CreateIndex
CREATE INDEX "EntitlementGrant_userId_createdAt_idx" ON "EntitlementGrant"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ConversionEvent_event_createdAt_idx" ON "ConversionEvent"("event", "createdAt");

-- CreateIndex
CREATE INDEX "ConversionEvent_userId_createdAt_idx" ON "ConversionEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ResearchCard" ADD CONSTRAINT "ResearchCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemRedemption" ADD CONSTRAINT "RedeemRedemption_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "RedeemCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedeemRedemption" ADD CONSTRAINT "RedeemRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntitlementGrant" ADD CONSTRAINT "EntitlementGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversionEvent" ADD CONSTRAINT "ConversionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
