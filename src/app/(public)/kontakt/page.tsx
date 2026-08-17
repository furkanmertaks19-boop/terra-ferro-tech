import type { Metadata } from "next";
import ContactView from "@/components/pages/ContactView";
import { getPublishedPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("contact");
  return {
    title: page.title || "Kontakt",
    description: page.description,
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPublishedPage("contact"), getSiteSettings()]);
  return <ContactView page={page} settings={settings} />;
}
