import type { Metadata } from "next";
import GalleryView from "@/components/pages/GalleryView";
import { getGalleryCategories, getPublishedGalleryItems } from "@/lib/gallery";
import { getPublishedPage } from "@/lib/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("gallery");
  return {
    title: page.title || "Galeria",
    description: page.description,
  };
}

export default async function GalleryPage() {
  const [page, items, categories] = await Promise.all([
    getPublishedPage("gallery"),
    getPublishedGalleryItems(),
    getGalleryCategories(),
  ]);
  const used = categories
    .filter((category) => category._count.items > 0)
    .map(({ id, name, slug }) => ({ id, name, slug }));

  return <GalleryView page={page} items={items} categories={used} />;
}
