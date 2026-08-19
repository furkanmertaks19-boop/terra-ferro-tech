import type { MetadataRoute } from "next";
import { Category, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, isProductionIndexingEnabled } from "@/lib/seo";
import { productHref } from "@/lib/product-path";
import { isUsedTractorsEnabled, listSitemapUsedTractors, usedTractorHref } from "@/lib/used-tractors";
import { LOCALES } from "@/lib/i18n/config";
import { alternatePaths, pathFor } from "@/lib/i18n/routing";

function entry(path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap[number] {
  const alts = alternatePaths(path);
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "weekly",
    priority,
    alternates: {
      languages: {
        sq: absoluteUrl(alts.sq),
        en: absoluteUrl(alts.en),
        tr: absoluteUrl(alts.tr),
        "x-default": absoluteUrl(alts.sq),
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexingEnabled()) return [];

  const now = new Date();
  const staticKeys = ["home", "about", "tractors", "equipment", "gallery", "services", "contact"] as const;
  const staticPages: MetadataRoute.Sitemap = [];
  for (const key of staticKeys) {
    for (const locale of LOCALES) {
      staticPages.push(entry(pathFor(key, locale), now, key === "home" ? 1 : key === "tractors" || key === "equipment" ? 0.9 : 0.7));
    }
  }

  let products: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: { slug: true, category: true, updatedAt: true },
    });
    products = rows.flatMap((row) =>
      LOCALES.map((locale) => entry(productHref({ category: row.category as Category, slug: row.slug }, locale), row.updatedAt, 0.8)),
    );
  } catch (error) {
    console.error("[sitemap]", error instanceof Error ? error.message : error);
  }

  let used: MetadataRoute.Sitemap = [];
  try {
    if (await isUsedTractorsEnabled()) {
      const rows = await listSitemapUsedTractors();
      used = LOCALES.flatMap((locale) => [
        entry(pathFor("used", locale), rows[0]?.updatedAt ?? now, 0.8),
        ...rows.map((row) => entry(usedTractorHref(row.slug, locale), row.updatedAt, 0.7)),
      ]);
    }
  } catch (error) {
    console.error("[sitemap used]", error instanceof Error ? error.message : error);
  }

  return [...staticPages, ...products, ...used];
}
