import type { Metadata } from "next";
import ServicesView from "@/components/pages/ServicesView";
import { getPublishedPage } from "@/lib/pages";
import { localePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return localePageMetadata("services");
}

export default async function ServicesPage() {
  const page = await getPublishedPage("services");
  return <ServicesView page={page} />;
}
