import { Category } from "@prisma/client";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import type { AdminCategory, CategoryTree } from "@/lib/category-types";

function mapRow(row: {
  id: string;
  kind: Category;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}): AdminCategory {
  return {
    id: row.id,
    kind: row.kind,
    parentId: row.parentId,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

export async function listProductCategories(): Promise<CategoryTree[]> {
  const rows = await withPrismaRetry(() =>
    prisma.productCategory.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }] })
  );
  const mapped = rows.map(mapRow);
  const roots = mapped.filter((row) => !row.parentId);
  return [Category.TRACTOR, Category.EQUIPMENT].map((kind) => {
    const root =
      roots.find((row) => row.kind === kind) ??
      ({
        id: `fallback-${kind}`,
        kind,
        parentId: null,
        name: kind === Category.TRACTOR ? "Traktörler" : "Tarım Makineleri",
        slug: kind === Category.TRACTOR ? "traktoret" : "makineri-bujqesore",
        sortOrder: 0,
        isActive: true,
      } satisfies AdminCategory);
    return {
      root,
      children: mapped.filter((row) => row.parentId === root.id),
    };
  });
}

export async function listActiveSubcategories(kind: Category): Promise<string[]> {
  try {
    const rows = await withPrismaRetry(() =>
      prisma.productCategory.findMany({
        where: { kind, isActive: true, parentId: { not: null } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { name: true },
      })
    );
    if (rows.length) return rows.map((row) => row.name);
  } catch {
    /* fallback */
  }
  return kind === Category.TRACTOR
    ? ["Orchard", "Field", "Cabin", "ROPS"]
    : ["Kultivator", "Çizel", "Rotovator", "Plug", "Plehë shpërndarës", "Spërkatës", "Diskaro", "Tesviye", "Kositje", "Other"];
}

export async function listSubcategoriesByKind() {
  const [tractors, equipment] = await Promise.all([
    listActiveSubcategories(Category.TRACTOR),
    listActiveSubcategories(Category.EQUIPMENT),
  ]);
  return { TRACTOR: tractors, EQUIPMENT: equipment };
}

export function uniqueCategorySlug(kind: Category, name: string, existing: string[]) {
  const base = slugify(name) || "kategori";
  let slug = base;
  let i = 2;
  while (existing.includes(`${kind}:${slug}`)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export type { AdminCategory, CategoryTree };
