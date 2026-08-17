import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toAdminProduct } from "@/lib/types";
import ProductEditor from "@/components/admin/editor/ProductEditor";
import { listSubcategoriesByKind } from "@/lib/product-categories";
import { editorProduct } from "@/lib/product-revision";
import { attachProductExtras } from "@/lib/product-extras";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await prisma.product.findUnique({ where: { id } });
  if (!found) notFound();
  const live = await attachProductExtras(found);
  const product = editorProduct(live);
  const [related, subcategoriesByKind] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: { id: true, name: true, slug: true, category: true },
    }),
    listSubcategoriesByKind(),
  ]);

  return <ProductEditor initial={toAdminProduct(product)} liveSlug={live.slug} related={related} subcategoriesByKind={subcategoriesByKind} />;
}
