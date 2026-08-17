import GalleryWorkspace from "@/components/admin/gallery/GalleryWorkspace";
import { getAdminGallery } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const { items, categories } = await getAdminGallery();
  return <GalleryWorkspace items={items} categories={categories} />;
}
