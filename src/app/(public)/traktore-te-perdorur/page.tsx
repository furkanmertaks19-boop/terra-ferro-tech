import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UsedTractorsListing from "@/components/used/UsedTractorsListing";
import { USED_TRACTORS_SEO, publicPageMetadata, robotsDirective } from "@/lib/seo";
import { isUsedTractorsEnabled, listPublicUsedTractors } from "@/lib/used-tractors";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isUsedTractorsEnabled())) {
    return { robots: robotsDirective(false), title: USED_TRACTORS_SEO.title };
  }
  return publicPageMetadata(USED_TRACTORS_SEO);
}

export default async function UsedTractorsPage() {
  if (!(await isUsedTractorsEnabled())) notFound();
  const items = await listPublicUsedTractors();
  return <UsedTractorsListing items={items} />;
}
