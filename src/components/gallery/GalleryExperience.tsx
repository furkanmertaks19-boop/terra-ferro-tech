"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "@phosphor-icons/react";
import type { PublicGalleryCategory, PublicGalleryItem } from "@/lib/gallery";
import { DURATION, EASE } from "@/lib/motion";
import GalleryLightbox from "./GalleryLightbox";

type Filter = "all" | "IMAGE" | "VIDEO";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Të gjitha" },
  { id: "IMAGE", label: "Foto" },
  { id: "VIDEO", label: "Video" },
];

export default function GalleryExperience({
  items,
  categories,
  showFilters = true,
}: {
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
  showFilters?: boolean;
}) {
  void categories;
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [items, filter],
  );

  return (
    <div>
      {showFilters ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`h-9 px-4 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors duration-150 ${
                filter === f.id
                  ? "bg-ink text-white"
                  : "text-ink/55 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-12 text-sm text-ink/45">Nuk ka ende media të publikuara në këtë filtër.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className="group relative block aspect-[4/3] overflow-hidden rounded-[6px] bg-[#e8e4da] text-left"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: DURATION.medium, delay: reduce ? 0 : (index % 8) * 0.04, ease: EASE }}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.altText || item.title || "Galeria"}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />

              {/* Hover overlay */}
              <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />

              {/* Video play icon */}
              {item.type === "VIDEO" ? (
                <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/65 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <Play size={16} weight="fill" />
                </span>
              ) : null}

              {/* Title on hover */}
              {item.title ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-ink/60 to-transparent px-4 pb-3 pt-8 text-[12px] font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.title}
                </span>
              ) : null}
            </motion.button>
          ))}
        </div>
      )}

      {active != null && visible[active] ? (
        <GalleryLightbox items={visible} index={active} onClose={() => setActive(null)} onIndex={setActive} />
      ) : null}
    </div>
  );
}
