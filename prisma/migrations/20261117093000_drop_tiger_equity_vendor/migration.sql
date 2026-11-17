-- Remove stale EquityMarketVendor value `tiger` (not in Prisma schema).
-- Prisma reads fail with: Value 'tiger' not found in enum 'EquityMarketVendor'.

UPDATE "User"
SET "equityVendor" = 'longbridge'
WHERE "equityVendor"::text NOT IN ('longbridge', 'futu');

ALTER TABLE "User" ALTER COLUMN "equityVendor" DROP DEFAULT;

ALTER TYPE "EquityMarketVendor" RENAME TO "EquityMarketVendor_old";

CREATE TYPE "EquityMarketVendor" AS ENUM ('longbridge', 'futu');

ALTER TABLE "User"
  ALTER COLUMN "equityVendor"
  TYPE "EquityMarketVendor"
  USING (
    CASE
      WHEN "equityVendor"::text IN ('longbridge', 'futu')
        THEN "equityVendor"::text::"EquityMarketVendor"
      ELSE 'longbridge'::"EquityMarketVendor"
    END
  );

ALTER TABLE "User"
  ALTER COLUMN "equityVendor"
  SET DEFAULT 'longbridge'::"EquityMarketVendor";

DROP TYPE "EquityMarketVendor_old";
