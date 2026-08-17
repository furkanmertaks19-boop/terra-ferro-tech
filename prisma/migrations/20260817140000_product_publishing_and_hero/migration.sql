-- Publishing workflow + cinematic hero fit. Additive only; no table drops.

ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "Product" ALTER COLUMN "template" SET DEFAULT 'tractor-cinematic';

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "hasUnpublishedChanges" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "draftRevision" JSONB;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "heroImageMode" TEXT NOT NULL DEFAULT 'AUTO';

UPDATE "Product"
SET "publishedAt" = "updatedAt"
WHERE "status" = 'PUBLISHED' AND "publishedAt" IS NULL;

UPDATE "Product"
SET "template" = 'tractor-cinematic'
WHERE "category" = 'TRACTOR'
  AND ("template" = 'premium-minimal' OR "template" = 'minimal' OR "template" IS NULL OR TRIM("template") = '');

UPDATE "Product"
SET "template" = 'equipment-showcase'
WHERE "category" = 'EQUIPMENT'
  AND ("template" = 'premium-minimal' OR "template" = 'minimal' OR "template" IS NULL OR TRIM("template") = '');
