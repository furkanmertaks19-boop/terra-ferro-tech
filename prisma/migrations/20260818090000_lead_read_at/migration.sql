-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_readAt_idx" ON "Lead"("readAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");
