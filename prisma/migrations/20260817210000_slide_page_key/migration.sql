-- AlterTable
ALTER TABLE "HomeSlide" ADD COLUMN "pageKey" TEXT NOT NULL DEFAULT 'home';

-- CreateIndex
CREATE INDEX "HomeSlide_pageKey_isActive_sortOrder_idx" ON "HomeSlide"("pageKey", "isActive", "sortOrder");
