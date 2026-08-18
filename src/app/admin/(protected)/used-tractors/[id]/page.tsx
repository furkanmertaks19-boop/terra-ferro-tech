import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UsedTractorEditor, { type UsedTractorEditorData } from "@/components/admin/used-tractors/UsedTractorEditor";

export default async function EditUsedTractorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.usedTractor.findUnique({ where: { id } });
  if (!row) notFound();

  const initial: UsedTractorEditorData = {
    id: row.id,
    brand: row.brand,
    model: row.model,
    slug: row.slug,
    year: row.year,
    hours: row.hours,
    horsePower: row.horsePower,
    fuelType: row.fuelType,
    hasCabin: row.hasCabin,
    transmission: row.transmission,
    drive: row.drive,
    location: row.location,
    shortDescription: row.shortDescription,
    description: row.description,
    specs: (row.specs as Record<string, string>) ?? {},
    coverImage: row.coverImage,
    images: row.images,
    imageAlts: (row.imageAlts as Record<string, string>) ?? {},
    technicalPdfUrl: row.technicalPdfUrl,
    technicalPdfPublicId: row.technicalPdfPublicId,
    technicalPdfName: row.technicalPdfName,
    technicalPdfSize: row.technicalPdfSize,
    price: row.price != null ? Number(row.price) : null,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {row.brand} {row.model}
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">2. el traktörü düzenleyin.</p>
      </div>
      <UsedTractorEditor initial={initial} />
    </div>
  );
}
