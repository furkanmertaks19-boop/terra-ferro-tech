-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "template" TEXT NOT NULL DEFAULT 'premium-minimal';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "coverImage" TEXT;

-- Map existing theme values to product page templates
UPDATE "Product" SET "template" = 'tractor-cinematic' WHERE "theme" = 'TRACTOR_THEME';
UPDATE "Product" SET "template" = 'equipment-showcase' WHERE "theme" = 'EQUIPMENT_THEME';

-- Homepage featured: keep existing campaign/new models visible
UPDATE "Product" SET "featured" = true WHERE "isCampaign" = true OR "isNew" = true;

-- Tractor series → subcategory
UPDATE "Product" SET "subcategory" = 'Orchard' WHERE "category" = 'TRACTOR' AND "subcategory" IS NULL AND "series" ILIKE '%orchard%';
UPDATE "Product" SET "subcategory" = 'Field' WHERE "category" = 'TRACTOR' AND "subcategory" IS NULL AND "series" ILIKE '%field%';

-- Equipment type → subcategory from name (no fake products)
UPDATE "Product" SET "subcategory" = 'Kultivator' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND "name" ILIKE '%kultivat%';
UPDATE "Product" SET "subcategory" = 'Çizel' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND "name" ILIKE '%cizel%';
UPDATE "Product" SET "subcategory" = 'Rotovator' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND ("name" ILIKE '%rotovator%' OR "name" ILIKE '%roto%');
UPDATE "Product" SET "subcategory" = 'Plug' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND ("name" ILIKE '%pulluk%' OR "name" ILIKE '%plug%');
UPDATE "Product" SET "subcategory" = 'Plehë shpërndarës' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND ("name" ILIKE '%gubre%' OR "name" ILIKE '%pleh%');
UPDATE "Product" SET "subcategory" = 'Spërkatës' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND ("name" ILIKE '%ilaçlama%' OR "name" ILIKE '%ilaclama%' OR "name" ILIKE '%spërkat%');
UPDATE "Product" SET "subcategory" = 'Diskaro' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND "name" ILIKE '%diskaro%';
UPDATE "Product" SET "subcategory" = 'Tesviye' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL AND ("name" ILIKE '%tesviye%' OR "name" ILIKE '%leveler%');
UPDATE "Product" SET "subcategory" = 'Other' WHERE "category" = 'EQUIPMENT' AND "subcategory" IS NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured");
CREATE INDEX IF NOT EXISTS "Product_template_idx" ON "Product"("template");
CREATE INDEX IF NOT EXISTS "Product_subcategory_idx" ON "Product"("subcategory");
