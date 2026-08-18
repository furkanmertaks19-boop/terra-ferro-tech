-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "UsedTractorStatus" AS ENUM ('DRAFT', 'FOR_SALE', 'RESERVED', 'SOLD', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "UsedTractorDrive" AS ENUM ('FOUR_WD', 'TWO_WD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "usedTractorsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "UsedTractor" (
    "id" TEXT NOT NULL,
    "status" "UsedTractorStatus" NOT NULL DEFAULT 'DRAFT',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER,
    "hours" INTEGER,
    "horsePower" DOUBLE PRECISION,
    "fuelType" TEXT,
    "hasCabin" BOOLEAN NOT NULL DEFAULT false,
    "transmission" TEXT,
    "drive" "UsedTractorDrive",
    "location" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "specs" JSONB NOT NULL DEFAULT '{}',
    "coverImage" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageAlts" JSONB NOT NULL DEFAULT '{}',
    "technicalPdfUrl" TEXT,
    "technicalPdfPublicId" TEXT,
    "technicalPdfName" TEXT,
    "technicalPdfSize" INTEGER,
    "price" DECIMAL(10,2),
    "showPriceOnSite" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedTractor_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "usedTractorId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UsedTractor_slug_key" ON "UsedTractor"("slug");
CREATE INDEX IF NOT EXISTS "UsedTractor_status_idx" ON "UsedTractor"("status");
CREATE INDEX IF NOT EXISTS "UsedTractor_sortOrder_idx" ON "UsedTractor"("sortOrder");
CREATE INDEX IF NOT EXISTS "UsedTractor_brand_idx" ON "UsedTractor"("brand");
CREATE INDEX IF NOT EXISTS "Lead_usedTractorId_idx" ON "Lead"("usedTractorId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Lead" ADD CONSTRAINT "Lead_usedTractorId_fkey"
    FOREIGN KEY ("usedTractorId") REFERENCES "UsedTractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
