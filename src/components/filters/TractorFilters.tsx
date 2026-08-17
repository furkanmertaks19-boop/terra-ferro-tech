"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { HP_RANGES } from "@/lib/templates";

type Props = {
  seriesOptions: string[];
  stageOptions: string[];
  searchPlaceholder?: string;
  hideSearch?: boolean;
};

export default function TractorFilters({ seriesOptions, stageOptions, searchPlaceholder, hideSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const form = (
    <div className="space-y-6">
      {!hideSearch && (
        <div>
          <label htmlFor="q" className="mb-2 block text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/50">
            Kërko
          </label>
          <input
            id="q"
            defaultValue={params.get("q") ?? ""}
            placeholder={searchPlaceholder ?? "Kërko sipas modelit..."}
            className="w-full border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
            onBlur={(e) => setParam("q", e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setParam("q", (e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
      )}

      {seriesOptions.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/50">Seria</legend>
          <div className="space-y-1.5">
            <FilterOption
              active={!params.get("series")}
              label="Të gjitha"
              onClick={() => setParam("series", "")}
            />
            {seriesOptions.map((series) => (
              <FilterOption
                key={series}
                active={(params.get("series") ?? "").toLowerCase() === series.toLowerCase() || series.toLowerCase().includes((params.get("series") ?? "").toLowerCase()) && !!params.get("series")}
                label={series}
                onClick={() => setParam("series", series.includes("Orchard") || series.toLowerCase().includes("orchard") ? "orchard" : series.includes("Field") || series.toLowerCase().includes("field") ? "field" : series)}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/50">Fuqia (HP)</legend>
        <div className="space-y-1.5">
          <FilterOption active={!params.get("hp")} label="Të gjitha" onClick={() => setParam("hp", "")} />
          {HP_RANGES.map((range) => (
            <FilterOption
              key={range.id}
              active={params.get("hp") === range.id}
              label={range.label}
              onClick={() => setParam("hp", range.id)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/50">Kabina / ROPS</legend>
        <div className="space-y-1.5">
          <FilterOption active={!params.get("cabin")} label="Të gjitha" onClick={() => setParam("cabin", "")} />
          <FilterOption active={params.get("cabin") === "yes"} label="Kabinë" onClick={() => setParam("cabin", "yes")} />
          <FilterOption active={params.get("cabin") === "no"} label="ROPS" onClick={() => setParam("cabin", "no")} />
        </div>
      </fieldset>

      {stageOptions.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/50">Stage</legend>
          <div className="space-y-1.5">
            <FilterOption active={!params.get("stage")} label="Të gjitha" onClick={() => setParam("stage", "")} />
            {stageOptions.map((stage) => (
              <FilterOption
                key={stage}
                active={params.get("stage") === stage}
                label={stage}
                onClick={() => setParam("stage", stage)}
              />
            ))}
          </div>
        </fieldset>
      )}

      {(params.toString() !== "" && params.toString() !== "sort=newest") && (
        <button
          type="button"
          className="text-xs font-medium text-ink/50 underline-offset-4 hover:text-brand-red hover:underline"
          onClick={() => router.push(pathname)}
        >
          Pastro filtrat
        </button>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 self-start border border-ink/10 bg-warm-white p-5 lg:sticky lg:top-28 lg:block">
        {form}
      </aside>
      <MobileFilters>{form}</MobileFilters>
    </>
  );
}

function FilterOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full border-l-2 px-3 py-1.5 text-left text-sm transition ${
        active ? "border-tractor-red text-tractor-red" : "border-transparent text-ink/70 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function MobileFilters({ children }: { children: React.ReactNode }) {
  const params = useSearchParams();
  const open = params.get("filters") === "1";
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function toggle(next: boolean) {
    const search = new URLSearchParams(params.toString());
    if (next) search.set("filters", "1");
    else search.delete("filters");
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => toggle(true)}
        className="mb-4 w-full border border-ink/15 bg-white px-4 py-3 text-sm font-semibold"
      >
        Filtro
      </button>
      {open && (
        <div className="fixed inset-0 z-[55] flex flex-col justify-end bg-ink/50">
          <div className="max-h-[85dvh] overflow-y-auto bg-warm p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">Filtro</p>
              <button type="button" onClick={() => toggle(false)} className="text-sm">
                Mbyll
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
