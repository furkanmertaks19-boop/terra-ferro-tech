import HeroSlider from "@/components/home/HeroSlider";
import ModelFinder from "@/components/home/ModelFinder";
import FeaturedTractorsSection from "@/components/home/FeaturedTractorsSection";
import FeaturedEquipmentSection from "@/components/home/FeaturedEquipmentSection";
import EquipmentRange from "@/components/home/EquipmentRange";
import BrandStory from "@/components/home/BrandStory";
import ServicesSection from "@/components/home/ServicesSection";
import FullWidthCta from "@/components/home/FullWidthCta";
import HeroSingle from "@/components/home/HeroSingle";
import ImageTextSection from "@/components/home/ImageTextSection";
import TechnicalHighlight from "@/components/home/TechnicalHighlight";
import ContactPreview from "@/components/home/ContactPreview";
import GalleryPreviewSection from "@/components/home/GalleryPreviewSection";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import type { PublicHeroSlide } from "@/lib/slide-types";
import type { PublicProduct } from "@/lib/types";
import type { RangeItem } from "@/lib/products";
import type { PublicSiteSettings } from "@/lib/site-settings";
import type { PublicGalleryItem } from "@/lib/gallery";

export type HomeRenderData = {
  sections: HomeSectionRecord[];
  slides: PublicHeroSlide[];
  featuredTractors: PublicProduct[];
  featuredEquipment: PublicProduct[];
  equipmentRange: RangeItem[];
  finder: { seriesOptions: string[]; hpOptions: number[] };
  settings: PublicSiteSettings;
  productsById: Record<string, PublicProduct>;
  galleryItems: PublicGalleryItem[];
};

function galleryFor(section: HomeSectionRecord, items: PublicGalleryItem[]) {
  const take = section.config.take ?? 6;
  if (section.config.source === "manual" && section.config.galleryItemIds?.length) {
    const byId = Object.fromEntries(items.map((item) => [item.id, item]));
    return section.config.galleryItemIds.map((id) => byId[id]).filter(Boolean).slice(0, take);
  }
  return items.slice(0, take);
}

function productsFor(section: HomeSectionRecord, fallback: PublicProduct[], byId: Record<string, PublicProduct>) {
  const ids = section.config.productIds ?? [];
  if (section.config.source === "manual" && ids.length) {
    return ids.map((id) => byId[id]).filter(Boolean);
  }
  const take = section.config.take ?? fallback.length;
  return fallback.slice(0, take);
}

export default function HomePageSections({ data }: { data: HomeRenderData }) {
  return (
    <div>
      {data.sections.map((section) => {
        switch (section.type) {
          case "hero-slider":
            return <HeroSlider key={section.id} slides={data.slides} />;
          case "hero-single":
            return <HeroSingle key={section.id} section={section} />;
          case "model-finder":
            return (
              <ModelFinder
                key={section.id}
                section={section}
                seriesOptions={data.finder.seriesOptions}
                hpOptions={data.finder.hpOptions}
              />
            );
          case "featured-tractors":
            return (
              <FeaturedTractorsSection
                key={section.id}
                section={section}
                products={productsFor(section, data.featuredTractors, data.productsById)}
              />
            );
          case "featured-equipment":
            return (
              <FeaturedEquipmentSection
                key={section.id}
                section={section}
                products={productsFor(section, data.featuredEquipment, data.productsById)}
              />
            );
          case "product-categories":
            return (
              <EquipmentRange
                key={section.id}
                section={section}
                items={data.equipmentRange.slice(0, section.config.categoryLimit ?? data.equipmentRange.length)}
              />
            );
          case "image-text":
            return <ImageTextSection key={section.id} section={section} />;
          case "about-split":
            return <BrandStory key={section.id} section={section} />;
          case "services-list":
            return <ServicesSection key={section.id} section={section} />;
          case "technical-highlight":
            return (
              <TechnicalHighlight
                key={section.id}
                section={section}
                product={productsFor(section, data.featuredTractors, data.productsById)[0] ?? null}
              />
            );
          case "cta-banner":
            return <FullWidthCta key={section.id} section={section} />;
          case "contact-preview":
            return <ContactPreview key={section.id} section={section} settings={data.settings} />;
          case "gallery-preview":
            return (
              <GalleryPreviewSection
                key={section.id}
                section={section}
                items={galleryFor(section, data.galleryItems)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
