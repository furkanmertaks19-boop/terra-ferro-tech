import type { Metadata } from "next";
import ContactView from "@/components/pages/ContactView";
import { getPublishedPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings-data";
import { localePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return localePageMetadata("contact");
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPublishedPage("contact"), getSiteSettings()]);
  return <ContactView page={page} settings={settings} />;
}
