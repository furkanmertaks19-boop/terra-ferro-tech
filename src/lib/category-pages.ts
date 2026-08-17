import { Category } from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { isTextPosition, type PublicCategoryPage } from "@/lib/category-page-types";

export type { PublicCategoryPage } from "@/lib/category-page-types";
export { isTextPosition } from "@/lib/category-page-types";

const FALLBACK: Record<Category, PublicCategoryPage> = {
  TRACTOR: {
    category: Category.TRACTOR,
    eyebrow: "GAMA E PRODUKTEVE",
    title: "Traktorët",
    subtitle: "Fuqi, efikasitet dhe teknologji për çdo lloj pune bujqësore.",
    desktopImage: "/images/home/category-tractors.jpg",
    mobileImage: null,
    overlayOpacity: 45,
    textPosition: "left",
  },
  EQUIPMENT: {
    category: Category.EQUIPMENT,
    eyebrow: "GAMA E PRODUKTEVE",
    title: "Makineri Bujqësore",
    subtitle: "Pajisje moderne për punimin e tokës, plehrimin dhe mbrojtjen e kulturave.",
    desktopImage: "/images/home/category-equipment.jpg",
    mobileImage: null,
    overlayOpacity: 45,
    textPosition: "left",
  },
};

export function mapCategoryPage(row: {
  category: Category;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string | null;
  overlayOpacity: number;
  textPosition: string;
}): PublicCategoryPage {
  return {
    category: row.category,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    desktopImage: row.desktopImage || FALLBACK[row.category].desktopImage,
    mobileImage: row.mobileImage,
    overlayOpacity: Math.min(80, Math.max(0, row.overlayOpacity)),
    textPosition: isTextPosition(row.textPosition) ? row.textPosition : "left",
  };
}

export async function getCategoryPage(category: Category): Promise<PublicCategoryPage> {
  try {
    const row = await withPrismaRetry(() => prisma.categoryPage.findUnique({ where: { category } }));
    if (row) return mapCategoryPage(row);
  } catch {
    /* use raw fallback */
  }
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        category: Category;
        eyebrow: string;
        title: string;
        subtitle: string;
        desktopImage: string;
        mobileImage: string | null;
        overlayOpacity: number;
        textPosition: string;
      }>
    >`SELECT "category", "eyebrow", "title", "subtitle", "desktopImage", "mobileImage", "overlayOpacity", "textPosition" FROM "CategoryPage" WHERE "category"::text = ${category} LIMIT 1`;
    if (rows[0]) return mapCategoryPage(rows[0]);
  } catch {
    /* use static fallback */
  }
  return FALLBACK[category];
}

export async function listCategoryPages() {
  try {
    const rows = await prisma.categoryPage.findMany({ orderBy: { category: "asc" } });
    const byCategory = new Map(rows.map((row) => [row.category, row]));
    return [Category.TRACTOR, Category.EQUIPMENT].map((category) => {
      const row = byCategory.get(category);
      return row
        ? { id: row.id, ...mapCategoryPage(row), updatedAt: row.updatedAt }
        : { id: null, ...FALLBACK[category], updatedAt: null as Date | null };
    });
  } catch {
    return [Category.TRACTOR, Category.EQUIPMENT].map((category) => ({
      id: null,
      ...FALLBACK[category],
      updatedAt: null as Date | null,
    }));
  }
}
