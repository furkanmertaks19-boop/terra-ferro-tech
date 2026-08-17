import { prisma } from "@/lib/prisma";
import { Category, Prisma, ProductStatus } from "@prisma/client";
import { toAdminProduct } from "@/lib/types";
import ProductsWorkspace from "@/components/admin/products/ProductsWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (k: string) => (Array.isArray(params[k]) ? params[k]?.[0] : params[k]);
  const q = get("q");
  const category = get("category");
  const status = get("status");
  const template = get("template");
  const featured = get("featured");
  const series = get("series");
  const subcategory = get("subcategory");

  const where: Prisma.ProductWhereInput = {};
  if (category === Category.TRACTOR || category === Category.EQUIPMENT) where.category = category;
  if (status === ProductStatus.DRAFT || status === ProductStatus.PUBLISHED || status === ProductStatus.ARCHIVED) {
    where.status = status;
  } else {
    where.status = { not: ProductStatus.ARCHIVED };
  }
  if (template) where.template = template;
  if (series) where.series = series;
  if (subcategory) where.subcategory = subcategory;
  if (featured === "1") where.featured = true;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { fullTitle: { contains: q, mode: "insensitive" } },
      { series: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, seriesRows, subRows] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { updatedAt: "desc" } }),
    prisma.product.findMany({ distinct: ["series"], select: { series: true }, orderBy: { series: "asc" } }),
    prisma.product.findMany({ distinct: ["subcategory"], select: { subcategory: true } }),
  ]);

  return (
    <ProductsWorkspace
      products={products.map(toAdminProduct)}
      query={{
        q: q ?? "",
        category: category ?? "",
        status: status ?? "",
        template: template ?? "",
        featured: featured ?? "",
        series: series ?? "",
        subcategory: subcategory ?? "",
      }}
      seriesOptions={seriesRows.map((r) => r.series)}
      subcategoryOptions={subRows.map((r) => r.subcategory).filter((v): v is string => Boolean(v))}
    />
  );
}
