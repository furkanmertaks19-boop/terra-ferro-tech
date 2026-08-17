import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/types";
import { editorProduct } from "@/lib/product-revision";
import { attachProductExtras } from "@/lib/product-extras";
import { ProductDetailView } from "@/lib/product-templates";
import { getSimilarProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await prisma.product.findUnique({ where: { id } });
  if (!found) notFound();
  const product = toPublicProduct(editorProduct(await attachProductExtras(found)));
  const similar = await getSimilarProducts(product);
  return <ProductDetailView product={product} similar={similar} preview />;
}
