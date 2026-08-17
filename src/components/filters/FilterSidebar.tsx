"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n";

export type FilterConfig = {
  basePath: string;
  seriesOptions?: string[];
  showCabin?: boolean;
  stageOptions?: string[];
  hpBounds?: { min: number; max: number };
};

export default function FilterSidebar(config: FilterConfig) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  const form = (
    <form action={config.basePath} method="get" className="space-y-5">
      {searchParams.get("sort") && (
        <input type="hidden" name="sort" value={searchParams.get("sort") ?? ""} />
      )}

      {config.seriesOptions && config.seriesOptions.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/60">
            {t.productList.series}
          </label>
          <select
            name="series"
            defaultValue={searchParams.get("series") ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">{t.productList.allSeries}</option>
            {config.seriesOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {config.hpBounds && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/60">
            {t.productList.horsePower}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="hpMin"
              placeholder={String(config.hpBounds.min)}
              defaultValue={searchParams.get("hpMin") ?? ""}
              className="w-full rounded border border-black/15 px-2 py-1.5 text-sm"
            />
            <span className="text-black/40">–</span>
            <input
              type="number"
              name="hpMax"
              placeholder={String(config.hpBounds.max)}
              defaultValue={searchParams.get("hpMax") ?? ""}
              className="w-full rounded border border-black/15 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      )}

      {config.showCabin && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/60">
            {t.productList.cabin}
          </label>
          <select
            name="cabin"
            defaultValue={searchParams.get("cabin") ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">{t.productList.allSeries}</option>
            <option value="yes">{t.productList.withCabin}</option>
            <option value="no">{t.productList.withoutCabin}</option>
          </select>
        </div>
      )}

      {config.stageOptions && config.stageOptions.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-black/60">
            {t.productList.stage}
          </label>
          <select
            name="stage"
            defaultValue={searchParams.get("stage") ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">{t.productList.allSeries}</option>
            {config.stageOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded bg-brand-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-anthracite"
      >
        {t.productList.filters}
      </button>
      <a
        href={config.basePath}
        className="block text-center text-xs font-medium text-black/50 hover:text-brand-red"
      >
        {t.productList.resetFilters}
      </a>
    </form>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          {t.productList.filters}
        </button>
      </div>

      <aside className="hidden w-64 shrink-0 rounded-lg border border-black/10 bg-white p-5 lg:block">
        {form}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-80 max-w-[85vw] flex-col overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">{t.productList.filters}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-xl">
                ✕
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
