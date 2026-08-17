-- Additive manufacturer reference URL. Public UI must not read this column.

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "referenceUrl" TEXT;
