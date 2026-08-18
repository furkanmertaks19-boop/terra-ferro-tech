import { Category, Prisma, ProductStatus } from "@prisma/client";

export const PRODUCT_TABS = ["all", "tractor", "equipment", "draft", "archive"] as const;
export type ProductTab = (typeof PRODUCT_TABS)[number];

export const PRODUCT_SORTS = ["updated", "created", "az", "za", "name", "manual"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type AdminProductQuery = {
  type: ProductTab;
  q: string;
  sort: ProductSort;
  series: string;
  subcategory: string;
  status: string;
  hpMin: string;
  hpMax: string;
  cabin: string;
  stage: string;
  noImage: string;
};

const KEYS: (keyof AdminProductQuery)[] = [
  "type",
  "q",
  "sort",
  "series",
  "subcategory",
  "status",
  "hpMin",
  "hpMax",
  "cabin",
  "stage",
  "noImage",
];

export const SORT_LABELS: Record<ProductSort, string> = {
  updated: "Son güncellenen",
  created: "Son eklenen",
  az: "A-Z",
  za: "Z-A",
  name: "Ürün adı",
  manual: "Manuel sıralama",
};

export const TAB_LABELS: Record<ProductTab, string> = {
  all: "Tüm Ürünler",
  tractor: "Traktörler",
  equipment: "Tarım Makineleri",
  draft: "Taslaklar",
  archive: "Arşiv",
};

function isTab(value: string): value is ProductTab {
  return PRODUCT_TABS.includes(value as ProductTab);
}

function isSort(value: string): value is ProductSort {
  return PRODUCT_SORTS.includes(value as ProductSort);
}

export function parseAdminProductQuery(get: (key: string) => string | undefined): AdminProductQuery {
  const rawType = get("type") ?? "";
  const category = get("category") ?? "";
  const status = get("status") ?? "";
  let type: ProductTab = "all";
  if (isTab(rawType)) type = rawType;
  else if (category === Category.TRACTOR) type = "tractor";
  else if (category === Category.EQUIPMENT) type = "equipment";
  else if (status === ProductStatus.DRAFT) type = "draft";
  else if (status === ProductStatus.ARCHIVED) type = "archive";

  const sortRaw = get("sort") ?? "";
  return {
    type,
    q: get("q") ?? "",
    sort: isSort(sortRaw) ? sortRaw : "updated",
    series: get("series") ?? "",
    subcategory: get("subcategory") ?? "",
    status: type === "draft" || type === "archive" ? "" : (get("status") ?? ""),
    hpMin: get("hpMin") ?? "",
    hpMax: get("hpMax") ?? "",
    cabin: get("cabin") ?? "",
    stage: get("stage") ?? "",
    noImage: get("noImage") ?? "",
  };
}

export function productsHref(current: AdminProductQuery, patch: Partial<Record<keyof AdminProductQuery, string | null>> = {}) {
  const next: Record<keyof AdminProductQuery, string> = { ...current };
  for (const key of KEYS) {
    if (!(key in patch)) continue;
    next[key] = patch[key] ?? "";
  }

  if (next.type !== "tractor") {
    next.hpMin = "";
    next.hpMax = "";
    next.cabin = "";
    next.stage = "";
  }
  if (next.type === "draft" || next.type === "archive") next.status = "";

  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = next[key];
    if (!value) continue;
    if (key === "type" && value === "all") continue;
    if (key === "sort" && value === "updated") continue;
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export function tabCategory(type: ProductTab): Category | null {
  if (type === "tractor") return Category.TRACTOR;
  if (type === "equipment") return Category.EQUIPMENT;
  return null;
}

export function isTractorTab(query: AdminProductQuery) {
  return query.type === "tractor";
}

export function advancedFilterCount(query: AdminProductQuery) {
  return ["series", "subcategory", "status", "hpMin", "hpMax", "cabin", "stage", "noImage"].filter((key) => query[key as keyof AdminProductQuery]).length;
}

export function canReorderProducts(query: AdminProductQuery) {
  return (
    query.sort === "manual" &&
    (query.type === "tractor" || query.type === "equipment") &&
    !query.q &&
    advancedFilterCount(query) === 0
  );
}

export function adminProductWhere(query: AdminProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const category = tabCategory(query.type);

  if (query.type === "draft") where.status = ProductStatus.DRAFT;
  else if (query.type === "archive") where.status = ProductStatus.ARCHIVED;
  else {
    if (category) where.category = category;
    if (query.status === ProductStatus.DRAFT || query.status === ProductStatus.PUBLISHED || query.status === ProductStatus.ARCHIVED) {
      where.status = query.status;
    } else {
      where.status = { not: ProductStatus.ARCHIVED };
    }
  }

  if (query.series) where.series = query.series;
  if (query.subcategory) where.subcategory = query.subcategory;
  if (query.stage) where.stage = query.stage;
  if (query.cabin === "cabin") where.hasCabin = true;
  if (query.cabin === "rops") where.hasCabin = false;

  const hpMin = Number(query.hpMin);
  const hpMax = Number(query.hpMax);
  const horsePower: Prisma.FloatNullableFilter = {};
  if (Number.isFinite(hpMin) && query.hpMin) horsePower.gte = hpMin;
  if (Number.isFinite(hpMax) && query.hpMax) horsePower.lte = hpMax;
  if (Object.keys(horsePower).length) where.horsePower = horsePower;

  if (query.noImage === "1") {
    where.AND = [{ OR: [{ coverImage: null }, { coverImage: "" }] }, { images: { equals: [] } }];
  }

  if (query.q.trim()) {
    const q = query.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { fullTitle: { contains: q, mode: "insensitive" } },
      { series: { contains: q, mode: "insensitive" } },
      { subcategory: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export function adminProductOrderBy(query: AdminProductQuery): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
  switch (query.sort) {
    case "created":
      return { createdAt: "desc" };
    case "az":
      return { name: "asc" };
    case "za":
      return { name: "desc" };
    case "name":
      return { fullTitle: "asc" };
    case "manual":
      return query.type === "all" || query.type === "draft" || query.type === "archive"
        ? [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }]
        : [{ sortOrder: "asc" }, { name: "asc" }];
    default:
      return { updatedAt: "desc" };
  }
}
