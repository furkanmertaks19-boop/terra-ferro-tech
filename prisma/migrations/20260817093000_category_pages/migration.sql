-- CreateTable CategoryPage
CREATE TABLE IF NOT EXISTS "CategoryPage" (
    "id" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "desktopImage" TEXT NOT NULL DEFAULT '',
    "mobileImage" TEXT,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 45,
    "textPosition" TEXT NOT NULL DEFAULT 'left',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CategoryPage_category_key" ON "CategoryPage"("category");

INSERT INTO "CategoryPage" ("id", "category", "eyebrow", "title", "subtitle", "desktopImage", "overlayOpacity", "textPosition", "createdAt", "updatedAt")
VALUES
(
  'catpage_tractor',
  'TRACTOR',
  'GAMA E PRODUKTEVE',
  'Traktorët',
  'Fuqi, efikasitet dhe teknologji për çdo lloj pune bujqësore.',
  '/images/home/category-tractors.jpg',
  45,
  'left',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'catpage_equipment',
  'EQUIPMENT',
  'GAMA E PRODUKTEVE',
  'Makineri Bujqësore',
  'Pajisje moderne për punimin e tokës, plehrimin dhe mbrojtjen e kulturave.',
  '/images/home/category-equipment.jpg',
  45,
  'left',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
