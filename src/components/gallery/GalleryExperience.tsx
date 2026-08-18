"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "@phosphor-icons/react";
import type { PublicGalleryCategory, PublicGalleryItem } from "@/lib/gallery";
import { DURATION, EASE } from "@/lib/motion";
import GalleryLightbox from "./GalleryLightbox";

type Filter = "all" | "IMAGE" | "VIDEO";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Të gjitha" },
    { id: "IMAGE", label: "Foto" },
    { id: "VIDEO", label: "Video" },
  ];

  return (
    <div ref={rootRef}>
      {showFilters ? (
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-11 border px-4 text-[12px] font-semibold tracking-[0.12em] uppercase transition ${
                filter === item.id
                  ? "border-ink bg-ink text-white"
                  : "border-ink/15 bg-white text-ink/65 hover:border-ink/40 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-16 text-ink/55">Nuk ka ende media të publikuara në këtë filtër.</p>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {visible.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden bg-[#ece8de] text-left"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: DURATION.medium, delay: reduce ? 0 : (index % 8) * 0.05, ease: EASE }}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.altText || item.title || "Galeria"}
                width={900}
                height={700}
                loading="lazy"
                className="h-auto w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              {item.type === "VIDEO" ? (
                <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-white">
                  <Play size={18} weight="fill" />
                </span>
              ) : null}
              {item.title ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent px-4 pb-3 pt-10 text-sm text-white opacity-0 transition duration-300 group-hover:opacity-100">
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
