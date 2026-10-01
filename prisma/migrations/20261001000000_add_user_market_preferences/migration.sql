DO $$
BEGIN
  CREATE TYPE "EquityMarketVendor" AS ENUM ('longbridge', 'futu');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "CryptoMarketVendor" AS ENUM ('binance', 'okx');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "equityVendor" "EquityMarketVendor" NOT NULL DEFAULT 'longbridge',
  ADD COLUMN IF NOT EXISTS "cryptoVendor" "CryptoMarketVendor" NOT NULL DEFAULT 'binance';