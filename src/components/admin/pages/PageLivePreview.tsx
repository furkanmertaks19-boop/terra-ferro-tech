"use client";

import { useMemo, useState } from "react";
import PageHero from "@/components/pages/PageHero";
import { HERO_HEIGHT_PX, toPublicPage, type PageKey, type PageRevision } from "@/lib/page-cms";

const FRAMES = {
  desktop: { label: "Desktop", width: 1280 },
  tablet: { label: "Tablet", width: 768 },
  mobile: { label: "Mobile", width: 390 },
} as const;

type Frame = keyof typeof FRAMES;

export default function PageLivePreview({ pageKey, revision }: { pageKey: PageKey; revision: PageRevision }) {
  const [frame, setFrame] = useState<Frame>("desktop");
  const page = useMemo(() => toPublicPage(pageKey, revision), [pageKey, revision]);
  const width = FRAMES[frame].width;

  return (
    <aside className="admin-panel overflow-hidden xl:sticky xl:top-24 xl:self-start">
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Canlı Önizleme</p>
        <div className="flex gap-1">
          {(Object.keys(FRAMES) as Frame[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`admin-btn min-h-8 px-2 text-[11px] ${frame === key ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => setFrame(key)}
            >
              {FRAMES[key].label}
            </button>
          ))}
        </div>
      </div>
      <div className="m-3 overflow-hidden bg-ink">
        <div
          className="origin-top-left"
          style={{
            width,
            transform: `scale(${Math.min(1, 312 / width)})`,
            height: (HERO_HEIGHT_PX[revision.heroHeight] + 48) * Math.min(1, 312 / width),
          }}
        >
          <div className="pointer-events-none">
            <PageHero page={page} />
          </div>
        </div>
      </div>
    </aside>
  );
}
