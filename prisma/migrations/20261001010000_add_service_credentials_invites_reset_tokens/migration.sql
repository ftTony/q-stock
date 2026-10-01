DO $$
BEGIN
  CREATE TYPE "ServiceCredentialProvider" AS ENUM ('email', 'ai');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "UserServiceCredential" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "ServiceCredentialProvider" NOT NULL,
  "payload" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserServiceCredential_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserServiceCredential_userId_idx"
  ON "UserServiceCredential"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserServiceCredential_userId_provider_key"
  ON "UserServiceCredential"("userId", "provider");

DO $$
BEGIN
  ALTER TABLE "UserServiceCredential"
    ADD CONSTRAINT "UserServiceCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "InviteCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "usedById" TEXT,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_code_key" ON "InviteCode"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_usedById_key" ON "InviteCode"("usedById");
CREATE INDEX IF NOT EXISTS "InviteCode_ownerId_idx" ON "InviteCode"("ownerId");

DO $$
BEGIN
  ALTER TABLE "InviteCode"
    ADD CONSTRAINT "InviteCode_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "InviteCode"
    ADD CONSTRAINT "InviteCode_usedById_fkey"
    FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key"
  ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx"
  ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx"
  ON "PasswordResetToken"("expiresAt");

DO $$
BEGIN
  ALTER TABLE "PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;