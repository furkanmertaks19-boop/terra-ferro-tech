import { prisma } from "@/lib/prisma";
import { Category, ProductStatus } from "@prisma/client";
import { toAdminProduct } from "@/lib/types";
import ProductsWorkspace from "@/components/admin/products/ProductsWorkspace";
import {
  adminProductOrderBy,
  adminProductWhere,
  parseAdminProductQuery,
  tabCategory,
} from "@/lib/admin-products-query";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]);
  const query = parseAdminProductQuery(get);
  const where = adminProductWhere(query);
  const category = tabCategory(query.type);
  const optionWhere = category ? { category } : query.type === "archive" ? { status: ProductStatus.ARCHIVED } : { status: { not: ProductStatus.ARCHIVED } };

  const [products, grouped, seriesRows, subRows, stageRows] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: adminProductOrderBy(query),
    }),
    prisma.product.groupBy({
      by: ["category", "status"],
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: optionWhere,
      distinct: ["series"],
      select: { series: true },
      orderBy: { series: "asc" },
    }),
    prisma.product.findMany({
      where: optionWhere,
      distinct: ["subcategory"],
      select: { subcategory: true },
      orderBy: { subcategory: "asc" },
    }),
    prisma.product.findMany({
      where: { category: Category.TRACTOR, stage: { not: null } },
      distinct: ["stage"],
      select: { stage: true },
      orderBy: { stage: "asc" },
    }),
  ]);

  const counts = { all: 0, tractor: 0, equipment: 0, draft: 0, archive: 0 };
  for (const row of grouped) {
    const n = row._count._all;
    if (row.status === ProductStatus.ARCHIVED) counts.archive += n;
    else {
      counts.all += n;
      if (row.category === Category.TRACTOR) counts.tractor += n;
      if (row.category === Category.EQUIPMENT) counts.equipment += n;
    }
    if (row.status === ProductStatus.DRAFT) counts.draft += n;
  }

  return (
    <ProductsWorkspace
      products={products.map(toAdminProduct)}
      query={query}
      counts={counts}
      seriesOptions={seriesRows.map((row) => row.series).filter(Boolean)}
      subcategoryOptions={subRows.map((row) => row.subcategory).filter((value): value is string => Boolean(value))}
      stageOptions={stageRows.map((row) => row.stage).filter((value): value is string => Boolean(value))}
    />
  );
}
