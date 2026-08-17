import ProductEditor from "@/components/admin/editor/ProductEditor";
import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";
import { listSubcategoriesByKind } from "@/lib/product-categories";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  const presetCategory = raw === Category.EQUIPMENT || raw === Category.TRACTOR ? raw : undefined;
  const [related, subcategoriesByKind] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: { id: true, name: true, slug: true, category: true },
    }),
    listSubcategoriesByKind(),
  ]);

  return <ProductEditor related={related} presetCategory={presetCategory} subcategoriesByKind={subcategoriesByKind} />;
}
