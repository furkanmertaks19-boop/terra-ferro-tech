"use client";

import HeroSlideView from "@/components/home/HeroSlideView";
import type { PublicHeroSlide } from "@/lib/slide-types";

const FRAMES = {
  desktop: "w-full max-w-[920px] aspect-[16/9]",
  tablet: "w-[min(100%,720px)] aspect-[4/3]",
  mobile: "w-[min(100%,390px)] aspect-[9/16]",
} as const;

export default function SlidePreview({
  slide,
  device,
}: {
  slide: PublicHeroSlide;
  device: keyof typeof FRAMES;
}) {
  if (!slide.desktopImage) {
    return (
      <div className="grid min-h-64 place-items-center rounded-[14px] border border-dashed border-[var(--admin-border-strong)] text-sm text-[var(--admin-muted)]">
        Desktop görsel yükleyin
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className={`overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-ink shadow-[var(--admin-shadow)] ${FRAMES[device]}`}>
        <HeroSlideView slide={slide} compact onQuote={() => undefined} />
      </div>
    </div>
  );
}
