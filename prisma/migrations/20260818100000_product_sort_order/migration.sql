-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill per category from newest to oldest so current catalog order is preserved.
WITH ordered AS (
  SELECT
    id,
    (ROW_NUMBER() OVER (PARTITION BY "category" ORDER BY "createdAt" DESC) - 1)::int AS idx
  FROM "Product"
)
UPDATE "Product" AS p
SET "sortOrder" = ordered.idx
FROM ordered
WHERE p.id = ordered.id;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_category_sortOrder_idx" ON "Product"("category", "sortOrder");
