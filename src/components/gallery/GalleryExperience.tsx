"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CaretLeft, CaretRight, Play } from "@phosphor-icons/react";
import type { PublicGalleryCategory, PublicGalleryItem } from "@/lib/gallery";
import { DURATION, EASE } from "@/lib/motion";
import GalleryLightbox from "./GalleryLightbox";

type Filter = "all" | "IMAGE" | "VIDEO" | string;

const PAGE_SIZE = 100;

export default function GalleryExperience({
  items,
  categories,
  showFilters = true,
}: {
  items: PublicGalleryItem[];
  categories: PublicGalleryCategory[];
  showFilters?: boolean;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<number | null>(null);

  function applyFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (filter === "all") return true;
      if (filter === "IMAGE" || filter === "VIDEO") return item.type === filter;
      return item.categoryId === filter;
    });
  }, [items, filter]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = visible.slice(start, start + PAGE_SIZE);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Të gjitha" },
    { id: "IMAGE", label: "Foto" },
    { id: "VIDEO", label: "Video" },
    ...categories.map((category) => ({ id: category.id, label: category.name })),
  ];

  function goToPage(next: number) {
    const clamped = Math.min(pageCount, Math.max(1, next));
    setPage(clamped);
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={rootRef}>
      {showFilters ? (
      <div className="flex flex-col gap-4 border-b border-warm/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyFilter(item.id)}
              className={`min-h-10 rounded-[3px] border px-4 text-[12px] font-semibold tracking-[0.12em] uppercase ${
                filter === item.id
                  ? "border-warm bg-warm text-ink"
                  : "border-warm/15 text-warm/65 hover:border-warm/40 hover:text-warm"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {visible.length > 0 ? (
          <p className="text-sm tabular-nums text-warm/45">
            {visible.length} media
          </p>
        ) : null}
      </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-16 text-warm/55">Nuk ka ende media të publikuara në këtë filtër.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((item, index) => {
              const globalIndex = start + index;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(globalIndex)}
                  className="group relative aspect-[4/3] overflow-hidden bg-graphite text-left"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: DURATION.medium, delay: reduce ? 0 : (index % 8) * 0.03, ease: EASE }}
                >
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.altText || item.title || "Galeria"}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/25" />
                  {item.type === "VIDEO" ? (
                    <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-warm">
                      <Play size={18} weight="fill" />
                    </span>
                  ) : null}
                  {item.title ? (
                    <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-ink/70 to-transparent px-4 pb-3 pt-8 text-sm text-warm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {item.title}
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          {pageCount > 1 ? (
            <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Faqet e galerisë">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center border border-warm/15 text-warm disabled:opacity-30"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                aria-label="Faqja e mëparshme"
              >
                <CaretLeft size={16} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === currentPage ? "page" : undefined}
                  onClick={() => goToPage(n)}
                  className={`grid h-11 min-w-11 place-items-center border px-3 font-display text-sm tabular-nums ${
                    n === currentPage
                      ? "border-warm bg-warm text-ink"
                      : "border-warm/15 text-warm/70 hover:border-warm/40"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="grid h-11 w-11 place-items-center border border-warm/15 text-warm disabled:opacity-30"
                disabled={currentPage === pageCount}
                onClick={() => goToPage(currentPage + 1)}
                aria-label="Faqja tjetër"
              >
                <CaretRight size={16} />
              </button>
            </nav>
          ) : null}
        </>
      )}

      {active != null && visible[active] ? (
        <GalleryLightbox items={visible} index={active} onClose={() => setActive(null)} onIndex={setActive} />
      ) : null}
    </div>
  );
}
