-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TRACTOR', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('TRACTOR_THEME', 'EQUIPMENT_THEME');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "theme" "Theme" NOT NULL,
    "series" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullTitle" TEXT NOT NULL,
    "stage" TEXT,
    "horsePower" DOUBLE PRECISION,
    "hasCabin" BOOLEAN NOT NULL DEFAULT false,
    "dealerPrice" DECIMAL(10,2) NOT NULL,
    "retailPrice" DECIMAL(10,2) NOT NULL,
    "isCampaign" BOOLEAN NOT NULL DEFAULT false,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "showPriceOnSite" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "specs" JSONB NOT NULL DEFAULT '{}',
    "images" TEXT[],
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_series_idx" ON "Product"("series");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
