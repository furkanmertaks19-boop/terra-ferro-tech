import type { MetadataRoute } from "next";
import { Category, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SEO, USED_TRACTORS_SEO, absoluteUrl, isProductionIndexingEnabled } from "@/lib/seo";
import { productHref } from "@/lib/product-path";
import { isUsedTractorsEnabled, listSitemapUsedTractors, usedTractorHref } from "@/lib/used-tractors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isProductionIndexingEnabled()) return [];

  const now = new Date();
  const staticPages = Object.values(PAGE_SEO).map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.path === "/" ? "weekly" : "weekly",
    priority: page.path === "/" ? 1 : page.path === "/traktoret" || page.path === "/makineri-bujqesore" ? 0.9 : 0.7,
  })) satisfies MetadataRoute.Sitemap;

  let products: MetadataRoute.Sitemap = [];
  try {
    const rows = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      select: { slug: true, category: true, updatedAt: true },
    });
    products = rows.map((row) => ({
      url: absoluteUrl(productHref({ category: row.category as Category, slug: row.slug })),
      lastModified: row.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap]", error instanceof Error ? error.message : error);
  }

  let used: MetadataRoute.Sitemap = [];
  try {
    if (await isUsedTractorsEnabled()) {
      const rows = await listSitemapUsedTractors();
      used = [
        {
          url: absoluteUrl(USED_TRACTORS_SEO.path),
          lastModified: rows[0]?.updatedAt ?? now,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        ...rows.map((row) => ({
          url: absoluteUrl(usedTractorHref(row.slug)),
          lastModified: row.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    }
  } catch (error) {
    console.error("[sitemap used]", error instanceof Error ? error.message : error);
  }

  try {
    const pages = await prisma.pageContent.findMany({
      select: { pageKey: true, updatedAt: true },
    });
    const pathByKey: Record<string, string> = {
      about: "/rreth-nesh",
      tractors: "/traktoret",
      equipment: "/makineri-bujqesore",
      gallery: "/galeri",
      services: "/sherbimet",
      contact: "/kontakt",
    };
    for (const page of pages) {
      const path = pathByKey[page.pageKey];
      if (!path) continue;
      const entry = staticPages.find((item) => item.url === absoluteUrl(path));
      if (entry) entry.lastModified = page.updatedAt;
    }
  } catch {
    // keep generated dates
  }

  return [...staticPages, ...products, ...used];
}
