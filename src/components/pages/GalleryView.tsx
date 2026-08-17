import PageHero from "@/components/pages/PageHero";
import GalleryExperience from "@/components/gallery/GalleryExperience";
import { parseGalleryConfig, type PublicPageContent } from "@/lib/page-cms";
import type { PublicGalleryCategory, PublicGalleryItem } from "@/lib/gallery";

export default function GalleryView({
  page,
  items,
  categories,
}: {
  page: PublicPageContent;
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
}) {
  const config = parseGalleryConfig(page.config);
  return (
    <div className="bg-ink pb-24 text-warm">
      <PageHero page={page} />
      <section className="container-site pt-10 md:pt-14">
        <GalleryExperience items={items} categories={categories} showFilters={config.showFilters} />
      </section>
    </div>
  );
}
