import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UsedTractorDetail from "@/components/used/UsedTractorDetail";
import JsonLd from "@/components/seo/JsonLd";
import { robotsDirective, usedTractorBreadcrumbJsonLd, usedTractorJsonLd, usedTractorMetadata } from "@/lib/seo";
import { getPublicUsedTractorBySlug, isUsedTractorsEnabled } from "@/lib/used-tractors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!(await isUsedTractorsEnabled())) {
    return { robots: robotsDirective(false) };
  }
  const { slug } = await params;
  const item = await getPublicUsedTractorBySlug(slug);
  if (!item) return { robots: robotsDirective(false) };
  return usedTractorMetadata(item);
}

export default async function UsedTractorPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isUsedTractorsEnabled())) notFound();
  const { slug } = await params;
  const item = await getPublicUsedTractorBySlug(slug);
  if (!item) notFound();
  return (
    <>
      <JsonLd data={usedTractorJsonLd(item)} />
      <JsonLd data={usedTractorBreadcrumbJsonLd(item)} />
      <UsedTractorDetail item={item} />
    </>
  );
}
