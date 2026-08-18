import type { Metadata } from "next";
import AboutView from "@/components/pages/AboutView";
import { getPublishedPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings-data";
import { PAGE_SEO, publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata(PAGE_SEO.about);
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPublishedPage("about"), getSiteSettings()]);
  return <AboutView page={page} settings={settings} />;
}
