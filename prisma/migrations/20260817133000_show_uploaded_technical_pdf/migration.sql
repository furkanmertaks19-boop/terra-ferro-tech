-- Uploaded technical documents should appear on the public product page
-- unless the editor later unchecks visibility.
UPDATE "Product"
SET "showTechnicalPdf" = true
WHERE "technicalPdfUrl" IS NOT NULL
  AND TRIM("technicalPdfUrl") <> '';
