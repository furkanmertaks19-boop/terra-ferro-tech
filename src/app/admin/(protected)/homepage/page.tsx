import HomepageWorkspace from "@/components/admin/homepage/HomepageWorkspace";
import { getHomeSections } from "@/lib/home-sections";
import { getAdminGalleryOptions } from "@/lib/gallery";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [sections, products, galleryItems] = await Promise.all([
    getHomeSections(true),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, category: true },
    }),
    getAdminGalleryOptions(),
  ]);
  return (
    <HomepageWorkspace
      sections={sections}
      products={products}
      galleryItems={galleryItems}
    />
  );
}
