import { notFound } from "next/navigation";
import { Category } from "@prisma/client";
import { isPageKey, toPublicPage } from "@/lib/page-cms";
import { getEditorPage } from "@/lib/pages";
import { getSiteSettings } from "@/lib/site-settings-data";
import { getGalleryCategories, getPublishedGalleryItems } from "@/lib/gallery";
import { getProductList } from "@/lib/products";
import AboutView from "@/components/pages/AboutView";
import ServicesView from "@/components/pages/ServicesView";
import ContactView from "@/components/pages/ContactView";
import GalleryView from "@/components/pages/GalleryView";
import TractorsListing from "@/components/catalog/TractorsListing";
import EquipmentListing from "@/components/catalog/EquipmentListing";

export const dynamic = "force-dynamic";

export default async function AdminPagePreview({ params }: { params: Promise<{ pageKey: string }> }) {
  const { pageKey } = await params;
  if (!isPageKey(pageKey)) notFound();
  const [{ revision }, settings] = await Promise.all([getEditorPage(pageKey), getSiteSettings()]);
  const page = toPublicPage(pageKey, revision);

  if (pageKey === "about") return <AboutView page={page} settings={settings} />;
  if (pageKey === "services") return <ServicesView page={page} />;
  if (pageKey === "contact") return <ContactView page={page} settings={settings} />;
  if (pageKey === "gallery") {
    const [items, categories] = await Promise.all([getPublishedGalleryItems(), getGalleryCategories()]);
    const used = categories
      .filter((category) => category._count.items > 0)
      .map(({ id, name, slug }) => ({ id, name, slug }));
    return <GalleryView page={page} items={items} categories={used} />;
  }
  if (pageKey === "tractors") {
    const list = await getProductList(Category.TRACTOR, {});
    return (
      <TractorsListing
        hero={page}
        products={list.products}
        seriesOptions={list.seriesOptions}
        stageOptions={list.stageOptions}
      />
    );
  }
  const list = await getProductList(Category.EQUIPMENT, {});
  return (
    <EquipmentListing
      hero={page}
      products={list.products}
      subcategoryOptions={list.subcategoryOptions}
    />
  );
}
