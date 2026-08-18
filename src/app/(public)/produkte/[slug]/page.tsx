import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { productHref } from "@/lib/product-path";
import { robotsDirective } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: robotsDirective(false),
};

export default async function LegacyProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  redirect(productHref(product));
}
