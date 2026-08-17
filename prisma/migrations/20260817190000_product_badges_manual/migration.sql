-- Manual badges only. Clear inherited campaign flags. Additive columns.

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "customBadge" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "customBadgeTone" TEXT;

UPDATE "Product"
SET "isCampaign" = false
WHERE "isCampaign" = true;

UPDATE "Product"
SET "draftRevision" = jsonb_set("draftRevision", '{isCampaign}', 'false'::jsonb, true)
WHERE "draftRevision" IS NOT NULL
  AND jsonb_typeof("draftRevision") = 'object';
