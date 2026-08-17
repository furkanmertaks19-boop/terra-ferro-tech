import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SlideEditor from "@/components/admin/sliders/SlideEditor";
import { toAdminSlide } from "@/lib/slides";

export const dynamic = "force-dynamic";

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slide = await prisma.homeSlide.findUnique({ where: { id } });
  if (!slide) notFound();
  return <SlideEditor initial={toAdminSlide(slide)} />;
}
