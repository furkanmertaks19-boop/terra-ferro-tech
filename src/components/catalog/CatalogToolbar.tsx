"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CaretDown, Faders } from "@phosphor-icons/react";
import { useT } from "@/components/i18n/LocaleProvider";

export default function CatalogToolbar({
  hideHp = false,
  searchPlaceholder = "Kërko makineri...",
  showFilters = false,
}: {
  hideHp?: boolean;
  hidePrice?: boolean;
  searchPlaceholder?: string;
  showFilters?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filtersOpen = searchParams.get("filters") === "1";

  const options = [
    { value: "newest", label: t.productList.sortNewest },
    { value: "name-asc", label: "Emri A-Z" },
    ...(!hideHp
      ? [
          { value: "hp-asc", label: t.productList.sortHpAsc },
          { value: "hp-desc", label: t.productList.sortHpDesc },
        ]
      : []),
  ];

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || (key === "sort" && value === "newest")) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (filtersOpen) params.delete("filters");
    else params.set("filters", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={searchPlaceholder}
          className="h-10 w-full border border-ink/15 bg-warm-white px-3 text-sm text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-ink/40 sm:h-11 sm:px-4 sm:text-base"
          onBlur={(e) => update("q", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
        />
      </label>
      <div className="flex min-w-0 items-center gap-2">
        {showFilters ? (
          <button
            type="button"
            onClick={toggleFilters}
            aria-expanded={filtersOpen}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 border border-ink/15 bg-warm-white px-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink lg:hidden"
          >
            <Faders size={14} />
            {t.productList.filters}
          </button>
        ) : null}
        <label className="flex min-w-0 flex-1 items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-ink/55 sm:flex-none">
          <span className="hidden sm:inline">Rendit</span>
          <span className="relative min-w-0 flex-1 sm:flex-none">
            <select
              value={searchParams.get("sort") ?? "newest"}
              onChange={(e) => update("sort", e.target.value)}
              className="h-10 w-full appearance-none border border-ink/15 bg-warm-white py-0 pl-3 pr-9 text-sm tracking-normal text-ink outline-none transition-colors focus:border-ink/40 sm:h-11 sm:w-auto sm:min-w-[11rem]"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <CaretDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50" />
          </span>
        </label>
      </div>
    </div>
  );
}
