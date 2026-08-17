"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import type { PublicGalleryItem } from "@/lib/gallery";
import { galleryLightboxUrl } from "@/lib/cloudinary-media";

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: PublicGalleryItem[];
  index: number;
  onClose: () => void;
  onIndex: (index: number) => void;
}) {
  const item = items[index];
  const touchX = useRef<number | null>(null);
  const many = items.length > 1;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && many) onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft" && many) onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, many, onClose, onIndex]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-ink/92 backdrop-blur-sm"
      onPointerDown={(e) => {
        touchX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (touchX.current == null || !many) return;
        const delta = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(delta) > 50) onIndex((index + (delta < 0 ? 1 : -1) + items.length) % items.length);
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-warm">
        <p className="font-display text-sm tabular-nums text-warm/70">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
        <button type="button" className="grid h-11 w-11 place-items-center border border-warm/20" onClick={onClose} aria-label="Mbyll">
          <X size={18} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8">
        {many ? (
          <button
            type="button"
            aria-label="E mëparshme"
            className="absolute left-4 z-10 hidden h-12 w-12 place-items-center border border-warm/20 text-warm md:grid"
            onClick={() => onIndex((index - 1 + items.length) % items.length)}
          >
            <CaretLeft size={20} />
          </button>
        ) : null}

        {item.type === "VIDEO" ? (
          <video
            key={item.id}
            src={item.mediaUrl}
            poster={item.thumbnailUrl}
            controls
            playsInline
            autoPlay
            className="max-h-[78svh] w-full max-w-5xl bg-black"
          />
        ) : (
          <div className="relative h-[78svh] w-full max-w-6xl">
            <Image
              src={galleryLightboxUrl(item.mediaUrl)}
              alt={item.altText || item.title || ""}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {many ? (
          <button
            type="button"
            aria-label="Tjetër"
            className="absolute right-4 z-10 hidden h-12 w-12 place-items-center border border-warm/20 text-warm md:grid"
            onClick={() => onIndex((index + 1) % items.length)}
          >
            <CaretRight size={20} />
          </button>
        ) : null}
      </div>

      {(item.title || item.description) && (
        <div className="mx-auto w-full max-w-3xl px-5 pb-8 text-center text-warm">
          {item.title ? <p className="font-display text-2xl">{item.title}</p> : null}
          {item.description ? <p className="mt-2 text-sm leading-relaxed text-warm/70">{item.description}</p> : null}
        </div>
      )}
    </div>
  );
}
