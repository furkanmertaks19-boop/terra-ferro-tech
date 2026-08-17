import { prisma, withPrismaRetry } from "./prisma";
import { isSlidePosition, type PublicHeroSlide } from "./slide-types";
import type { HomeSlide } from "@prisma/client";
import type { AdminSlide } from "./slide-types";

export type { AdminSlide } from "./slide-types";

export function toAdminSlide(slide: HomeSlide): AdminSlide {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow,
    title: slide.title,
    subtitle: slide.subtitle,
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage,
    primaryButtonText: slide.primaryButtonText,
    primaryButtonUrl: slide.primaryButtonUrl,
    secondaryButtonText: slide.secondaryButtonText,
    secondaryButtonUrl: slide.secondaryButtonUrl,
    contentPosition: slide.contentPosition,
    overlayOpacity: slide.overlayOpacity,
    isActive: slide.isActive,
    sortOrder: slide.sortOrder,
    autoplayDuration: slide.autoplayDuration,
    createdAt: slide.createdAt.toISOString(),
    updatedAt: slide.updatedAt.toISOString(),
    startsAt: slide.startsAt?.toISOString() ?? null,
    endsAt: slide.endsAt?.toISOString() ?? null,
  };
}

export async function getActiveHomeSlides(): Promise<PublicHeroSlide[]> {
  const now = new Date();
  let rows: HomeSlide[] = [];
  try {
    rows = await withPrismaRetry(() =>
      prisma.homeSlide.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { sortOrder: "asc" },
      }),
    );
  } catch {
    return [];
  }

  return rows
    .filter((row) => row.desktopImage)
    .map((row) => ({
      id: row.id,
      eyebrow: row.eyebrow,
      title: row.title,
      subtitle: row.subtitle,
      desktopImage: row.desktopImage,
      mobileImage: row.mobileImage,
      primaryButtonText: row.primaryButtonText,
      primaryButtonUrl: row.primaryButtonUrl,
      secondaryButtonText: row.secondaryButtonText,
      secondaryButtonUrl: row.secondaryButtonUrl,
      contentPosition: isSlidePosition(row.contentPosition) ? row.contentPosition : "left-center",
      overlayOpacity: Math.min(85, Math.max(0, row.overlayOpacity)),
      autoplayDuration: Math.min(20000, Math.max(3000, row.autoplayDuration || 7000)),
    }));
}
