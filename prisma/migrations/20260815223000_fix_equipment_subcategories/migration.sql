-- Remap equipment subcategories that fell through to Other because of Turkish characters.
UPDATE "Product"
SET "subcategory" = 'Kultivator'
WHERE "category" = 'EQUIPMENT'
  AND ("name" ILIKE '%kultivat%' OR "name" ILIKE '%kültivat%' OR "name" ILIKE '%kazaya%');

UPDATE "Product"
SET "subcategory" = 'Çizel'
WHERE "category" = 'EQUIPMENT'
  AND ("name" ILIKE '%cizel%' OR "name" ILIKE '%çizel%');

UPDATE "Product"
SET "subcategory" = 'Plehë shpërndarës'
WHERE "category" = 'EQUIPMENT'
  AND ("name" ILIKE '%gubre%' OR "name" ILIKE '%gübre%' OR "name" ILIKE '%serpme%');

UPDATE "Product"
SET "subcategory" = 'Kositje'
WHERE "category" = 'EQUIPMENT'
  AND ("name" ILIKE '%biçme%' OR "name" ILIKE '%bicme%' OR "name" ILIKE '%çayır%' OR "name" ILIKE '%cayir%');
