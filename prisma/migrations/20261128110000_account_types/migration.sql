-- Account types: cash + margin, with per-account borrowing and interest tracking.
CREATE TYPE "AccountType" AS ENUM ('cash', 'margin');

-- PaperAccount: drop the single-account unique constraint, add type + margin fields.
DROP INDEX IF EXISTS "PaperAccount_userId_key";
ALTER TABLE "PaperAccount"
  ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'cash',
  ADD COLUMN "borrowedBalance" DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN "interestAccrued" DECIMAL(18,4) NOT NULL DEFAULT 0,
  ADD COLUMN "interestAccruedAt" TIMESTAMP(3);

-- Existing accounts (created before this migration) become the user's cash account.
UPDATE "PaperAccount" SET "accountType" = 'cash' WHERE "accountType" IS NULL OR "accountType" = 'cash';

CREATE UNIQUE INDEX "PaperAccount_userId_accountType_key" ON "PaperAccount"("userId", "accountType");
CREATE INDEX "PaperAccount_userId_idx" ON "PaperAccount"("userId");

-- Give every existing user a margin account seeded with the same starting cash.
INSERT INTO "PaperAccount" ("id", "userId", "accountType", "cashBalance", "currency", "borrowedBalance", "interestAccrued", "createdAt", "updatedAt")
SELECT concat('margin_', "userId"), "userId", 'margin', 100000, 'USD', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "PaperAccount"
WHERE "accountType" = 'cash'
  AND NOT EXISTS (
    SELECT 1 FROM "PaperAccount" m WHERE m."userId" = "PaperAccount"."userId" AND m."accountType" = 'margin'
  );

-- Positions & orders carry the account type so books stay isolated.
ALTER TABLE "PaperPosition"
  ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'cash';
DROP INDEX IF EXISTS "PaperPosition_userId_symbol_assetType_key";
CREATE UNIQUE INDEX "PaperPosition_userId_accountType_symbol_assetType_key"
  ON "PaperPosition"("userId", "accountType", "symbol", "assetType");
DROP INDEX IF EXISTS "PaperPosition_userId_idx";
CREATE INDEX "PaperPosition_userId_accountType_idx" ON "PaperPosition"("userId", "accountType");

ALTER TABLE "PaperOrder"
  ADD COLUMN "accountType" "AccountType" NOT NULL DEFAULT 'cash';
DROP INDEX IF EXISTS "PaperOrder_userId_status_idx";
CREATE INDEX "PaperOrder_userId_accountType_status_idx" ON "PaperOrder"("userId", "accountType", "status");
