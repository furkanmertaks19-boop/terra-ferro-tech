import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UsedTractorsListing from "@/components/used/UsedTractorsListing";
import { localePageMetadata, robotsDirective } from "@/lib/seo";
import { isUsedTractorsEnabled, listPublicUsedTractors } from "@/lib/used-tractors";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  if (!(await isUsedTractorsEnabled())) {
    return { robots: robotsDirective(false) };
  }
  return localePageMetadata("used");
}

export default async function UsedTractorsPage() {
  if (!(await isUsedTractorsEnabled())) notFound();
  const items = await listPublicUsedTractors();
  return <UsedTractorsListing items={items} />;
}
