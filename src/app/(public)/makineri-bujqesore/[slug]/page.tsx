import { notFound, redirect } from "next/navigation";
import { Category } from "@prisma/client";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { ProductDetailView } from "@/lib/product-templates";
import { productHref } from "@/lib/product-path";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.category !== Category.EQUIPMENT) redirect(productHref(product));
  const similar = await getSimilarProducts(product);
  return <ProductDetailView product={product} similar={similar} />;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.fullTitle,
    description: product.shortDescription ?? product.description ?? undefined,
    alternates: { canonical: `/makineri-bujqesore/${product.slug}` },
  };
}
