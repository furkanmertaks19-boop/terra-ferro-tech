-- CreateTable PageContent
CREATE TABLE IF NOT EXISTS "PageContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "heroType" TEXT NOT NULL DEFAULT 'image',
    "heroImage" TEXT NOT NULL DEFAULT '',
    "mobileImage" TEXT,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 45,
    "textPosition" TEXT NOT NULL DEFAULT 'left',
    "heroHeight" TEXT NOT NULL DEFAULT 'standard',
    "slides" JSONB NOT NULL DEFAULT '[]',
    "config" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "draftRevision" JSONB,
    "hasUnpublishedChanges" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PageContent_pageKey_key" ON "PageContent"("pageKey");
