-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('once', 'daily', 'always');

-- AlterTable
ALTER TABLE "PriceAlert" ADD COLUMN "frequency" "AlertFrequency" NOT NULL DEFAULT 'always';
