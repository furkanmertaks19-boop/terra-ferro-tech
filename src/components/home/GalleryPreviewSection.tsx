"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "@phosphor-icons/react";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import type { PublicGalleryItem } from "@/lib/gallery";
import { useT } from "@/components/i18n/LocaleProvider";

export default function GalleryPreviewSection({
  section,
  items,
}: {
  section: HomeSectionRecord;
  items: PublicGalleryItem[];
}) {
  const t = useT();
  if (!items.length) return null;
  const title = section.title || t.home.galleryHeadline;
  const body = section.body || t.home.galleryBody;
  const ctaLabel = section.ctaLabel || t.home.galleryCta;
  const ctaHref = section.ctaHref || "/galeri";
  const eyebrow = section.eyebrow || t.nav.gallery;

  return (
    <section className="section-pad bg-ivory text-ink">
      <div className="container-site">
        <SectionIndex index="06" label={eyebrow} tone="light" />
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-tight">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/65">{body}</p>

        <Stagger className="mt-8 grid grid-cols-12 gap-3">
          {items.slice(0, section.config.take ?? 6).map((item, index) => (
            <StaggerItem
              key={item.id}
              className={index === 0 ? "col-span-12 min-h-[280px] md:col-span-7 md:min-h-[340px]" : "col-span-6 min-h-[160px] md:col-span-5 md:min-h-[220px]"}
            >
              <Link href="/galeri" className="relative block h-full min-h-[160px] overflow-hidden bg-[#d9d3c6] md:min-h-[220px]">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.altText || item.title || "Galeri"}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                {item.type === "VIDEO" ? (
                  <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-warm">
                    <Play size={18} weight="fill" />
                  </span>
                ) : null}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8">
          <Button href={ctaHref} variant="dark" arrow>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
