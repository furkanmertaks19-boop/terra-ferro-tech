import HomePageSections from "@/components/home/HomePageSections";
import { getActiveHomeSlides } from "@/lib/slides";
import {
  getEquipmentCategoryRange,
  getFeaturedEquipment,
  getFeaturedTractors,
  getProductsByIds,
  getTractorFinderOptions,
} from "@/lib/products";
import { getHomeSections } from "@/lib/home-sections";
import { getPublishedGalleryItems } from "@/lib/gallery";
import { getSiteSettings } from "@/lib/site-settings-data";
import { getCurrentUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const preview = params.preview === "1";
  const user = preview ? await getCurrentUser() : null;
  const includeHidden = Boolean(user);

  const [sections, featuredTractors, featuredEquipment, finder, slides, equipmentRange, settings, galleryItems] = await Promise.all([
    getHomeSections(includeHidden),
    getFeaturedTractors(4),
    getFeaturedEquipment(4),
    getTractorFinderOptions(),
    getActiveHomeSlides(),
    getEquipmentCategoryRange(),
    getSiteSettings(),
    getPublishedGalleryItems(),
  ]);

  const manualIds = sections.flatMap((section) => section.config.productIds ?? []);
  const extra = await getProductsByIds(Array.from(new Set(manualIds)));
  const productsById = Object.fromEntries([...featuredTractors, ...featuredEquipment, ...extra].map((product) => [product.id, product]));

  return (
    <HomePageSections
      data={{
        sections,
        slides,
        featuredTractors,
        featuredEquipment,
        equipmentRange,
        finder,
        settings,
        productsById,
        galleryItems,
      }}
    />
  );
}
