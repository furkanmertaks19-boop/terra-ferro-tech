-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductCategory" (
    "id" TEXT NOT NULL,
    "kind" "Category" NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_kind_slug_key" ON "ProductCategory"("kind", "slug");
CREATE INDEX IF NOT EXISTS "ProductCategory_kind_parentId_sortOrder_idx" ON "ProductCategory"("kind", "parentId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "ProductCategory"
    ADD CONSTRAINT "ProductCategory_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "HomeSection" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "variant" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL DEFAULT '',
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "mobileImage" TEXT,
    "ctaLabel" TEXT NOT NULL DEFAULT '',
    "ctaHref" TEXT NOT NULL DEFAULT '',
    "config" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HomeSection_sortOrder_isVisible_idx" ON "HomeSection"("sortOrder", "isVisible");

INSERT INTO "ProductCategory" ("id", "kind", "parentId", "name", "slug", "sortOrder", "isActive")
VALUES
  ('pcat_tractor_root', 'TRACTOR', NULL, 'Traktörler', 'traktoret', 0, true),
  ('pcat_equipment_root', 'EQUIPMENT', NULL, 'Tarım Makineleri', 'makineri-bujqesore', 0, true)
ON CONFLICT ("kind", "slug") DO NOTHING;

INSERT INTO "ProductCategory" ("id", "kind", "parentId", "name", "slug", "sortOrder", "isActive")
VALUES
  ('pcat_tr_orchard', 'TRACTOR', 'pcat_tractor_root', 'Orchard', 'orchard', 0, true),
  ('pcat_tr_field', 'TRACTOR', 'pcat_tractor_root', 'Field', 'field', 1, true),
  ('pcat_tr_cabin', 'TRACTOR', 'pcat_tractor_root', 'Cabin', 'cabin', 2, true),
  ('pcat_tr_rops', 'TRACTOR', 'pcat_tractor_root', 'ROPS', 'rops', 3, true),
  ('pcat_eq_kultivator', 'EQUIPMENT', 'pcat_equipment_root', 'Kultivator', 'kultivator', 0, true),
  ('pcat_eq_cizel', 'EQUIPMENT', 'pcat_equipment_root', 'Çizel', 'cizel', 1, true),
  ('pcat_eq_rotovator', 'EQUIPMENT', 'pcat_equipment_root', 'Rotovator', 'rotovator', 2, true),
  ('pcat_eq_plug', 'EQUIPMENT', 'pcat_equipment_root', 'Plug', 'plug', 3, true),
  ('pcat_eq_plehe', 'EQUIPMENT', 'pcat_equipment_root', 'Plehë shpërndarës', 'plehe-shperndares', 4, true),
  ('pcat_eq_sperkates', 'EQUIPMENT', 'pcat_equipment_root', 'Spërkatës', 'sperkates', 5, true),
  ('pcat_eq_diskaro', 'EQUIPMENT', 'pcat_equipment_root', 'Diskaro', 'diskaro', 6, true),
  ('pcat_eq_tesviye', 'EQUIPMENT', 'pcat_equipment_root', 'Tesviye', 'tesviye', 7, true),
  ('pcat_eq_kositje', 'EQUIPMENT', 'pcat_equipment_root', 'Kositje', 'kositje', 8, true),
  ('pcat_eq_other', 'EQUIPMENT', 'pcat_equipment_root', 'Other', 'other', 9, true)
ON CONFLICT ("kind", "slug") DO NOTHING;

INSERT INTO "HomeSection" ("id", "type", "variant", "title", "eyebrow", "body", "image", "ctaLabel", "ctaHref", "config", "sortOrder", "isVisible")
VALUES
  ('home_hero_slider', 'hero-slider', 'default', 'Hero Slider', '', 'Slider Yönetimi''ndeki aktif slaytlar', NULL, '', '', '{}', 0, true),
  ('home_model_finder', 'model-finder', 'default', 'Gjej modelin', 'Gjej modelin', 'Kërkoni sipas modelit, serisë ose fuqisë.', NULL, 'Shiko Traktorët', '/traktoret', '{}', 1, true),
  ('home_featured_tractors', 'featured-tractors', 'default', 'Modelet e zgjedhura të traktorëve', 'Traktorët', 'Zgjidhni nga modelet më të përshtatshme për pemishte, fusha dhe përdorim të përditshëm.', NULL, 'Shiko të gjithë traktorët', '/traktoret', '{"source":"featured","take":3}', 2, true),
  ('home_equipment', 'product-categories', 'default', 'Makineri për tokën.', 'Makineri Bujqësore', 'Kultivatorë, rotovatorë, plugje dhe pajisje nga katalogu.', NULL, 'Shiko Makineritë', '/makineri-bujqesore', '{"categoryLimit":8}', 3, true),
  ('home_services', 'services-list', 'default', 'Nga zgjedhja te servisi.', 'Shërbimet', '', NULL, '', '/sherbimet', '{}', 4, true),
  ('home_about', 'about-split', 'image-left', 'Partneri juaj në mekanizimin bujqësor.', 'Terra Ferro Tech', 'Terra Ferro Tech është përfaqësues i traktorëve dhe makinerive bujqësore Armatrac në Shqipëri. Ofrojmë shitje, këshillim teknik dhe pjesë këmbimi për fermerët dhe bizneset bujqësore.', '/images/home/brand-story.jpg', 'Rreth Nesh', '/rreth-nesh', '{"features":[{"title":"Shitje e drejtpërdrejtë","body":"Modele të zgjedhura sipas kushteve reale të tokës, jo katalogu i përgjithshëm."},{"title":"Servis dhe pjesë","body":"Makina mbetet në fushë vetëm nëse ka mbështetje pas shitjes."},{"title":"Prani lokale","body":"Bazuar në Lushnjë, me kontakt të drejtpërdrejtë për fermerët në Shqipëri."}]}', 5, true),
  ('home_cta', 'cta-banner', 'red', 'Kërkoni makinën e duhur?', '', 'Flisni me ekipin tonë.', NULL, 'Kërko Ofertë', '/kontakt', '{}', 6, true)
ON CONFLICT ("id") DO NOTHING;
