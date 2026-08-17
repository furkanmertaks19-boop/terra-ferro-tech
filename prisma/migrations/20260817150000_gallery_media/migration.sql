-- CreateEnum
CREATE TYPE "GalleryItemType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "GalleryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryItem" (
    "id" TEXT NOT NULL,
    "type" "GalleryItemType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "thumbnailUrl" TEXT,
    "posterPublicId" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GalleryCategory_slug_key" ON "GalleryCategory"("slug");
CREATE INDEX "GalleryCategory_sortOrder_idx" ON "GalleryCategory"("sortOrder");
CREATE INDEX "GalleryItem_isPublished_sortOrder_idx" ON "GalleryItem"("isPublished", "sortOrder");
CREATE INDEX "GalleryItem_type_isPublished_idx" ON "GalleryItem"("type", "isPublished");
CREATE INDEX "GalleryItem_categoryId_idx" ON "GalleryItem"("categoryId");

ALTER TABLE "GalleryItem"
ADD CONSTRAINT "GalleryItem_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "GalleryCategory"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "GalleryCategory" ("id", "name", "slug", "sortOrder", "createdAt", "updatedAt")
VALUES
  ('galcat_trakto', 'Traktorë', 'traktore', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('galcat_makine', 'Makineri', 'makineri', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('galcat_evente', 'Evente', 'evente', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('galcat_dorezi', 'Dorëzime', 'dorezime', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('galcat_showro', 'Showroom', 'showroom', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
