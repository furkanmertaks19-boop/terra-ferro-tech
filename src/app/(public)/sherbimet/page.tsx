import type { Metadata } from "next";
import ServicesView from "@/components/pages/ServicesView";
import { getPublishedPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("services");
  return {
    title: page.title || "Shërbimet",
    description: page.description,
  };
}

export default async function ServicesPage() {
  const page = await getPublishedPage("services");
  return <ServicesView page={page} />;
}
