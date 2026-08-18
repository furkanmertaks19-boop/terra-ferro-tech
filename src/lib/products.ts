import { isDbConnectionError, prisma, withPrismaRetry } from "@/lib/prisma";
import { toPublicProduct, type PublicProduct } from "@/lib/types";
import { EQUIPMENT_GROUPS, HP_RANGES } from "@/lib/templates";
import { Category, Prisma, ProductStatus } from "@prisma/client";

export const publicProductSelect = {
  id: true,
  category: true,
  template: true,
  status: true,
  featured: true,
  series: true,
  subcategory: true,
  name: true,
  fullTitle: true,
  stage: true,
  horsePower: true,
  hasCabin: true,
  isCampaign: true,
  isNew: true,
  shortDescription: true,
  description: true,
  specs: true,
  specGroups: true,
  coverImage: true,
  images: true,
  contentBlocks: true,
  heroImageMode: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export type ListFilters = {
  series?: string;
  cabin?: "yes" | "no";
  stage?: string;
  hp?: string;
  hpMin?: number;
  hpMax?: number;
  q?: string;
  subcategory?: string;
  group?: string;
  sort?: "newest" | "hp-asc" | "hp-desc" | "name-asc";
};

const published: Prisma.ProductWhereInput = { status: ProductStatus.PUBLISHED };

export function parseListFilters(searchParams: Record<string, string | string[] | undefined>): ListFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const toNum = (v: string | undefined) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    series: get("series") || undefined,
    cabin: get("cabin") === "yes" || get("cabin") === "no" ? (get("cabin") as "yes" | "no") : undefined,
    stage: get("stage") || undefined,
    hp: get("hp") || undefined,
    hpMin: toNum(get("hpMin")),
    hpMax: toNum(get("hpMax")),
    q: get("q") || undefined,
    subcategory: get("subcategory") || get("type") || undefined,
    group: get("group") || undefined,
    sort: (get("sort") as ListFilters["sort"]) || "newest",
  };
}

function buildOrderBy(sort: ListFilters["sort"]): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "name-asc":
      return { name: "asc" };
    case "hp-asc":
      return { horsePower: "asc" };
    case "hp-desc":
      return { horsePower: "desc" };
    default:
      return [{ sortOrder: "asc" }, { createdAt: "desc" }];
  }
}

function hpFilter(filters: ListFilters): Prisma.FloatNullableFilter | undefined {
  const range = HP_RANGES.find((item) => item.id === filters.hp);
  const min = range?.min ?? filters.hpMin;
  const max = range?.max ?? filters.hpMax;
  if (min == null && max == null) return undefined;
  return {
    ...(min != null ? { gte: min } : {}),
    ...(max != null ? { lte: max } : {}),
  };
}

function buildWhere(category: Category, filters: ListFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { ...published, category };

  if (filters.series) {
    where.series = { contains: filters.series, mode: "insensitive" };
  }
  if (filters.stage) where.stage = filters.stage;
  if (filters.cabin === "yes") where.hasCabin = true;
  if (filters.cabin === "no") where.hasCabin = false;
  if (filters.subcategory) {
    where.subcategory = filters.subcategory;
  } else if (filters.group) {
    const group = EQUIPMENT_GROUPS.find((item) => item.id === filters.group);
    if (group) where.subcategory = { in: [...group.types] };
  }

  const horsePower = hpFilter(filters);
  if (horsePower) where.horsePower = horsePower;

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { fullTitle: { contains: q, mode: "insensitive" } },
      { series: { contains: q, mode: "insensitive" } },
      { subcategory: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function mapPublic(row: Parameters<typeof toPublicProduct>[0]): PublicProduct {
  return toPublicProduct(row);
}

async function withBadgeFields<T extends { id: string }>(rows: T[]) {
  if (rows.length === 0) return rows;
  try {
    const ids = rows.map((row) => row.id);
    const extras = await prisma.$queryRaw<
      Array<{ id: string; customBadge: string | null; customBadgeTone: string | null; isCampaign: boolean; isNew: boolean }>
    >`
      SELECT id, "customBadge", "customBadgeTone", "isCampaign", "isNew"
      FROM "Product"
      WHERE id IN (${Prisma.join(ids)})
    `;
    const map = new Map(extras.map((row) => [row.id, row]));
    return rows.map((row) => {
      const extra = map.get(row.id);
      return extra ? { ...row, ...extra } : row;
    });
  } catch {
    return rows;
  }
}

async function mapPublicRows(rows: Array<{ id: string }>) {
  const withBadges = await withBadgeFields(rows);
  return withBadges.map((row) => toPublicProduct(row as unknown as Parameters<typeof toPublicProduct>[0]));
}

async function runProductQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await withPrismaRetry(fn);
  } catch (error) {
    if (!isDbConnectionError(error)) {
      console.error("[products]", error instanceof Error ? error.message : String(error));
    }
    return fallback;
  }
}

const emptyList = {
  products: [] as PublicProduct[],
  allInCategory: [] as PublicProduct[],
  seriesOptions: [] as string[],
  stageOptions: [] as string[],
  subcategoryOptions: [] as string[],
  hpBounds: undefined as { min: number; max: number } | undefined,
};

export async function getProductList(category: Category, filters: ListFilters) {
  const where = buildWhere(category, filters);

  return runProductQuery(async () => {
    const [products, allInCategory] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: buildOrderBy(filters.sort),
        select: publicProductSelect,
      }),
      prisma.product.findMany({
        where: { ...published, category },
        select: publicProductSelect,
      }),
    ]);

    const seriesOptions = Array.from(new Set(allInCategory.map((p) => p.series))).sort();
    const stageOptions = Array.from(
      new Set(allInCategory.map((p) => p.stage).filter((s): s is string => !!s))
    ).sort();
    const subcategoryOptions = Array.from(
      new Set(allInCategory.map((p) => p.subcategory).filter((s): s is string => !!s))
    ).sort();

    const hpValues = allInCategory.map((p) => p.horsePower).filter((v): v is number => v != null);
    const [listed, all] = await Promise.all([withBadgeFields(products), withBadgeFields(allInCategory)]);

    return {
      products: listed.map(mapPublic),
      allInCategory: all.map(mapPublic),
      seriesOptions,
      stageOptions,
      subcategoryOptions,
      hpBounds: hpValues.length ? { min: Math.min(...hpValues), max: Math.max(...hpValues) } : undefined,
    };
  }, emptyList);
}

async function readPublicExtras(id: string) {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        technicalPdfUrl: string | null;
        showTechnicalPdf: boolean;
        heroImageMode: string | null;
        customBadge: string | null;
        customBadgeTone: string | null;
      }>
    >`
      SELECT "technicalPdfUrl", "showTechnicalPdf", "heroImageMode", "customBadge", "customBadgeTone"
      FROM "Product"
      WHERE "id" = ${id}
      LIMIT 1
    `;
    return rows[0] ?? { technicalPdfUrl: null, showTechnicalPdf: false, heroImageMode: "AUTO", customBadge: null, customBadgeTone: null };
  } catch {
    try {
      const rows = await prisma.$queryRaw<
        Array<{ technicalPdfUrl: string | null; showTechnicalPdf: boolean }>
      >`
        SELECT "technicalPdfUrl", "showTechnicalPdf"
        FROM "Product"
        WHERE "id" = ${id}
        LIMIT 1
      `;
      return { ...(rows[0] ?? { technicalPdfUrl: null, showTechnicalPdf: false }), heroImageMode: "AUTO", customBadge: null, customBadgeTone: null };
    } catch {
      return { technicalPdfUrl: null, showTechnicalPdf: false, heroImageMode: "AUTO", customBadge: null, customBadgeTone: null };
    }
  }
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const product = await runProductQuery(async () => {
    return prisma.product.findFirst({
      where: { slug, ...published },
      select: publicProductSelect,
    });
  }, null);
  if (!product) return null;
  const extras = await readPublicExtras(product.id);
  return mapPublic({ ...product, ...extras });
}

export async function getSimilarProducts(product: PublicProduct, take = 4): Promise<PublicProduct[]> {
  return runProductQuery(async () => {
    if (product.category === Category.TRACTOR) {
      const candidates = await prisma.product.findMany({
        where: { ...published, category: Category.TRACTOR, id: { not: product.id } },
        select: publicProductSelect,
      });
      const hp = product.horsePower;
      const ranked = candidates
        .map((row) => ({
          row,
          seriesRank: row.series === product.series ? 0 : 1,
          hpDelta: hp != null && row.horsePower != null ? Math.abs(row.horsePower - hp) : 999,
        }))
        .sort((a, b) => a.seriesRank - b.seriesRank || a.hpDelta - b.hpDelta)
        .slice(0, take)
        .map((item) => item.row);
      return mapPublicRows(ranked);
    }

    const similar = await prisma.product.findMany({
      where: {
        ...published,
        category: Category.EQUIPMENT,
        id: { not: product.id },
        ...(product.subcategory ? { subcategory: product.subcategory } : { series: product.series }),
      },
      take,
      orderBy: { updatedAt: "desc" },
      select: publicProductSelect,
    });
    return mapPublicRows(similar);
  }, []);
}

export async function searchProducts(
  query: string,
  take = 8,
  category?: Category
): Promise<PublicProduct[]> {
  if (!query.trim()) return [];
  return runProductQuery(async () => {
    const results = await prisma.product.findMany({
      where: {
        ...published,
        ...(category ? { category } : {}),
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { fullTitle: { contains: query, mode: "insensitive" } },
          { series: { contains: query, mode: "insensitive" } },
        ],
      },
      take,
      orderBy: { createdAt: "desc" },
      select: publicProductSelect,
    });
    return mapPublicRows(results);
  }, []);
}

export async function getFeaturedProducts(take = 4): Promise<PublicProduct[]> {
  return runProductQuery(async () => {
    const products = await prisma.product.findMany({
      where: { ...published, featured: true },
      orderBy: [{ category: "asc" }, { horsePower: "desc" }],
      take,
      select: publicProductSelect,
    });
    return mapPublicRows(products);
  }, []);
}

export async function getFeaturedTractors(take = 3): Promise<PublicProduct[]> {
  return runProductQuery(async () => {
    const featured = await prisma.product.findMany({
      where: { ...published, featured: true, category: Category.TRACTOR },
      orderBy: { horsePower: "desc" },
      take,
      select: publicProductSelect,
    });

    if (featured.length >= take) return mapPublicRows(featured);

    const extra = await prisma.product.findMany({
      where: {
        ...published,
        category: Category.TRACTOR,
        ...(featured.length > 0 ? { id: { notIn: featured.map((product) => product.id) } } : {}),
      },
      orderBy: [{ featured: "desc" }, { horsePower: "desc" }],
      take: take - featured.length,
      select: publicProductSelect,
    });

    return mapPublicRows([...featured, ...extra]);
  }, []);
}

export async function getFeaturedEquipment(take = 3): Promise<PublicProduct[]> {
  return runProductQuery(async () => {
    const featured = await prisma.product.findMany({
      where: { ...published, featured: true, category: Category.EQUIPMENT },
      orderBy: { updatedAt: "desc" },
      take,
      select: publicProductSelect,
    });
    if (featured.length >= take) return mapPublicRows(featured);
    const extra = await prisma.product.findMany({
      where: {
        ...published,
        category: Category.EQUIPMENT,
        ...(featured.length > 0 ? { id: { notIn: featured.map((product) => product.id) } } : {}),
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: take - featured.length,
      select: publicProductSelect,
    });
    return mapPublicRows([...featured, ...extra]);
  }, []);
}

export async function getProductsByIds(ids: string[]): Promise<PublicProduct[]> {
  if (!ids.length) return [];
  return runProductQuery(async () => {
    const products = await prisma.product.findMany({
      where: { ...published, id: { in: ids } },
      select: publicProductSelect,
    });
    const order = new Map(ids.map((id, index) => [id, index]));
    return mapPublicRows(products.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)));
  }, []);
}

export async function getTractorFinderOptions() {
  return runProductQuery(async () => {
    const tractors = await prisma.product.findMany({
      where: { ...published, category: Category.TRACTOR },
      select: { series: true, horsePower: true },
    });
    const seriesOptions = Array.from(new Set(tractors.map((p) => p.series))).sort();
    const hpOptions = Array.from(
      new Set(tractors.map((p) => p.horsePower).filter((v): v is number => v != null))
    ).sort((a, b) => a - b);
    return { seriesOptions, hpOptions };
  }, { seriesOptions: [] as string[], hpOptions: [] as number[] });
}

export type RangeItem = {
  key: string;
  label: string;
  image: string | null;
  href: string;
  count: number;
  meta?: string;
};

function seriesListHref(series: string) {
  const lower = series.toLowerCase();
  if (lower.includes("orchard")) return "/traktoret?series=orchard";
  if (lower.includes("field")) return "/traktoret?series=field";
  return `/traktoret?series=${encodeURIComponent(series)}`;
}

export async function getTractorSeriesRange(): Promise<RangeItem[]> {
  return runProductQuery(async () => {
    const tractors = await prisma.product.findMany({
      where: { ...published, category: Category.TRACTOR },
      orderBy: [{ featured: "desc" }, { horsePower: "desc" }],
      select: { series: true, coverImage: true, images: true, horsePower: true },
    });

    const map = new Map<string, RangeItem>();
    for (const product of tractors) {
      const image = product.coverImage || product.images[0] || null;
      const existing = map.get(product.series);
      if (existing) {
        existing.count += 1;
        if (!existing.image && image) existing.image = image;
        continue;
      }
      map.set(product.series, {
        key: product.series,
        label: product.series,
        image,
        href: seriesListHref(product.series),
        count: 1,
        meta: product.horsePower != null ? `${product.horsePower} HP` : undefined,
      });
    }
    return Array.from(map.values());
  }, []);
}

export async function getEquipmentCategoryRange(): Promise<RangeItem[]> {
  return runProductQuery(async () => {
    const items = await prisma.product.findMany({
      where: { ...published, category: Category.EQUIPMENT },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { subcategory: true, series: true, coverImage: true, images: true },
    });

    const map = new Map<string, RangeItem>();
    for (const product of items) {
      const key = product.subcategory || product.series;
      if (!key) continue;
      const image = product.coverImage || product.images[0] || null;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (!existing.image && image) existing.image = image;
        continue;
      }
      map.set(key, {
        key,
        label: key,
        image,
        href: `/makineri-bujqesore?subcategory=${encodeURIComponent(key)}`,
        count: 1,
      });
    }
    return Array.from(map.values());
  }, []);
}

export async function getEngineeringStoryProduct(): Promise<PublicProduct | null> {
  const featured = await getFeaturedTractors(1);
  if (featured[0]) return featured[0];
  return runProductQuery(async () => {
    const fallback = await prisma.product.findFirst({
      where: { ...published, category: Category.TRACTOR },
      orderBy: { horsePower: "desc" },
      select: publicProductSelect,
    });
    return fallback ? (await mapPublicRows([fallback]))[0] ?? null : null;
  }, null);
}
