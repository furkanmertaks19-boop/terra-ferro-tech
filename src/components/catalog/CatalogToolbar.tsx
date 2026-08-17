"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { t } from "@/lib/i18n";

export default function CatalogToolbar({
  hideHp = false,
  searchPlaceholder = "Kërko makineri...",
}: {
  hideHp?: boolean;
  hidePrice?: boolean;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative min-w-0 flex-1 sm:max-w-sm">
        <span className="sr-only">{searchPlaceholder}</span>
        <input
          defaultValue={searchParams.get("q") ?? ""}
          placeholder={searchPlaceholder}
          className="w-full border border-ink/15 bg-warm-white px-4 py-3 text-base text-ink placeholder:text-ink/40 outline-none transition-colors focus:border-ink/40"
          onBlur={(e) => update("q", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              update("q", (e.target as HTMLInputElement).value.trim());
            }
          }}
        />
      </label>
      <label className="flex items-center gap-3 text-[13px] tracking-[0.08em] uppercase text-ink/55">
        Rendit
        <span className="relative">
          <select
            value={searchParams.get("sort") ?? "newest"}
            onChange={(e) => update("sort", e.target.value)}
            className="appearance-none border border-ink/15 bg-warm-white py-3 pl-4 pr-10 text-base tracking-normal text-ink outline-none transition-colors focus:border-ink/40"
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
  );
}
