"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { cinematicHeroUrl, galleryLightboxUrl } from "@/lib/cloudinary-media";
import { cinematicHeroFit } from "@/lib/hero-image-mode";
import { t } from "@/lib/i18n";

export default function ProductMediaGallery({
  images,
  alt,
  heroImageMode,
  layout = "hero",
}: {
  images: string[];
  alt: string;
  heroImageMode?: string | null;
  layout?: "hero" | "section";
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const fit = cinematicHeroFit(heroImageMode);
  const current = images[active];

  const go = useCallback(
    (delta: number) => {
      if (images.length < 2) return;
      setActive((index) => (index + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [go, open]);

  if (!current) {
    return (
      <div className="grid aspect-[4/3] place-items-center border border-ink/8 bg-[#ece8de] text-ink/40">
        <span className="text-sm tracking-[0.12em] uppercase">{t.productDetail.noImage}</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden border border-ink/[0.08] bg-[linear-gradient(180deg,#f7f4ee_0%,#ebe6db_100%)] shadow-[0_18px_40px_-24px_rgba(28,24,18,0.35)] ${
          layout === "hero" ? "aspect-[4/3] md:aspect-[5/4]" : "aspect-[16/10]"
        }`}
        onTouchStart={(event) => {
          touchX.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchX.current == null) return;
          const endX = event.changedTouches[0]?.clientX ?? touchX.current;
          const delta = endX - touchX.current;
          if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <button type="button" className="absolute inset-0 z-[1]" onClick={() => setOpen(true)} aria-label={alt}>
          <span className="sr-only">{alt}</span>
        </button>
        <Image
          src={cinematicHeroUrl(current)}
          alt={alt}
          fill
          priority={layout === "hero"}
          className={`p-6 md:p-10 ${fit === "cover" ? "object-cover p-0" : "object-contain"}`}
          sizes="(min-width: 1024px) 52vw, 100vw"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Fotoja e mëparshme"
              className="absolute left-3 top-1/2 z-[2] grid h-10 w-10 -translate-y-1/2 place-items-center border border-ink/10 bg-warm-white/90 text-ink"
              onClick={() => go(-1)}
            >
              <CaretLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Fotoja tjetër"
              className="absolute right-3 top-1/2 z-[2] grid h-10 w-10 -translate-y-1/2 place-items-center border border-ink/10 bg-warm-white/90 text-ink"
              onClick={() => go(1)}
            >
              <CaretRight size={16} />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-[68px] w-[88px] shrink-0 overflow-hidden border bg-[#ece8de] ${
                index === active ? "border-tractor-red" : "border-ink/10 opacity-75 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill className="object-contain p-1.5" sizes="88px" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/88 p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0" aria-label="Mbyll" onClick={() => setOpen(false)} />
          <button
            type="button"
            className="absolute right-4 top-4 z-[1] grid h-11 w-11 place-items-center border border-warm/20 text-warm"
            onClick={() => setOpen(false)}
            aria-label="Mbyll"
          >
            <X size={18} />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-[1] grid h-11 w-11 -translate-y-1/2 place-items-center border border-warm/20 text-warm"
                onClick={() => go(-1)}
                aria-label="Fotoja e mëparshme"
              >
                <CaretLeft size={18} />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-[1] grid h-11 w-11 -translate-y-1/2 place-items-center border border-warm/20 text-warm"
                onClick={() => go(1)}
                aria-label="Fotoja tjetër"
              >
                <CaretRight size={18} />
              </button>
            </>
          ) : null}
          <div className="relative z-[1] h-[min(82dvh,860px)] w-full max-w-5xl">
            <Image src={galleryLightboxUrl(current)} alt={alt} fill className="object-contain" sizes="90vw" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
