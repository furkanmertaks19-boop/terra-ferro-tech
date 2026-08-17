import type { Metadata } from "next";
import AboutView from "@/components/pages/AboutView";
import { getPublishedPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("about");
  return {
    title: page.title || "Rreth Nesh",
    description: page.description,
  };
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getPublishedPage("about"), getSiteSettings()]);
  return <AboutView page={page} settings={settings} />;
}
