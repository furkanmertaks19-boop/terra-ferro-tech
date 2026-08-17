import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SlidersWorkspace from "@/components/admin/sliders/SlidersWorkspace";
import { toAdminSlide } from "@/lib/slides";

export const dynamic = "force-dynamic";

export default async function SlidersPage() {
  const slides = await prisma.homeSlide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Ana Sayfa Slider</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Ana sayfadaki büyük tanıtım alanlarını yönetin.</p>
        </div>
        <Link href="/admin/sliders/new" className="admin-btn admin-btn-primary">
          + Yeni Slide
        </Link>
      </div>
      <SlidersWorkspace slides={slides.map(toAdminSlide)} />
    </div>
  );
}
