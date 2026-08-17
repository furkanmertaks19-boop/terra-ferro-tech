import { notFound, redirect } from "next/navigation";
import { Category } from "@prisma/client";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { ProductDetailView } from "@/lib/product-templates";
import { productHref } from "@/lib/product-path";

export const dynamic = "force-dynamic";

export default async function TractorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.category !== Category.TRACTOR) redirect(productHref(product));
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
    alternates: { canonical: `/traktoret/${product.slug}` },
  };
}
