import PageBanner from "@/components/pages/PageBanner";
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
    <div className="bg-ivory pb-20 text-ink">
      <PageBanner page={page} />
      <section className="container-site pt-6 md:pt-8">
        <GalleryExperience items={items} categories={categories} showFilters={config.showFilters} />
      </section>
    </div>
  );
}
