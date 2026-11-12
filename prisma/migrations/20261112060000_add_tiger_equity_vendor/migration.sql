-- AlterEnum EquityMarketVendor: add tiger
ALTER TYPE "EquityMarketVendor" ADD VALUE IF NOT EXISTS 'tiger';

-- AlterEnum MarketCredentialProvider: add tiger
ALTER TYPE "MarketCredentialProvider" ADD VALUE IF NOT EXISTS 'tiger';
