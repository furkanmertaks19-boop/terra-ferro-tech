-- CreateTable HomeSlide
CREATE TABLE IF NOT EXISTS "HomeSlide" (
    "id" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "desktopImage" TEXT NOT NULL,
    "mobileImage" TEXT,
    "primaryButtonText" TEXT NOT NULL DEFAULT '',
    "primaryButtonUrl" TEXT NOT NULL DEFAULT '',
    "secondaryButtonText" TEXT NOT NULL DEFAULT '',
    "secondaryButtonUrl" TEXT NOT NULL DEFAULT '',
    "contentPosition" TEXT NOT NULL DEFAULT 'left-center',
    "overlayOpacity" INTEGER NOT NULL DEFAULT 55,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "autoplayDuration" INTEGER NOT NULL DEFAULT 7000,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSlide_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "HomeSlide_isActive_sortOrder_idx" ON "HomeSlide"("isActive", "sortOrder");

-- CreateTable SiteSettings
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneHref" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mapEmbedUrl" TEXT NOT NULL,
    "website" TEXT NOT NULL DEFAULT 'www.terraferrotech.com',
    "whatsapp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "companyName", "email", "phone", "phoneHref", "location", "mapEmbedUrl", "website", "whatsapp", "createdAt", "updatedAt")
VALUES (
  'default',
  'Terra Ferro Tech',
  'terraferrotech@gmail.com',
  '+355 75 237 83 83',
  '+355752378383',
  'Lushnje, Albania',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.720848428033!2d19.697975176632845!3d40.92186622474014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135005a630bc5ec3%3A0x621aca5ad69934d!2sTerraFerroTech!5e0!3m2!1str!2str!4v1786942419249!5m2!1str!2str',
  'www.terraferrotech.com',
  '355752378383',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "HomeSlide" ("id", "eyebrow", "title", "subtitle", "desktopImage", "primaryButtonText", "primaryButtonUrl", "secondaryButtonText", "secondaryButtonUrl", "contentPosition", "overlayOpacity", "isActive", "sortOrder", "autoplayDuration", "createdAt", "updatedAt")
VALUES
(
  'slide_tractors',
  'Fuqia për çdo tokë',
  'Fuqia që lëviz bujqësinë.',
  'Traktorë Armatrac për pemishte, sera dhe fusha të hapura, me këshillim dhe mbështetje në Shqipëri.',
  '/images/hero/slide-01.jpg',
  'Shiko Traktorët',
  '/traktoret',
  'Kërko Ofertë',
  '#quote',
  'left-center',
  55,
  true,
  0,
  7000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'slide_equipment',
  'Makineri bujqësore',
  'Pajisjet që përfundojnë punën.',
  'Kultivatorë, rotovatorë, plugje dhe spërkatëse të përshtatura me gamën e traktorëve tanë.',
  '/images/hero/slide-02.jpg',
  'Shiko Makineritë',
  '/makineri-bujqesore',
  'Kërko Ofertë',
  '#quote',
  'left-center',
  55,
  true,
  1,
  7000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'slide_service',
  'Terra Ferro Tech',
  'Partneri juaj pas shitjes.',
  'Zgjedhje e modelit, pjesë këmbimi dhe mbështetje teknike për fermerët në të gjithë vendin.',
  '/images/hero/slide-03.jpg',
  'Na Kontaktoni',
  '/kontakt',
  'Rreth Nesh',
  '/rreth-nesh',
  'left-center',
  55,
  true,
  2,
  7000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
