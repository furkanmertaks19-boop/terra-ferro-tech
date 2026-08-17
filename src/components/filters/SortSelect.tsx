"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

const options = [
  { value: "newest", label: t.productList.sortNewest },
  { value: "name-asc", label: "Emri A-Z" },
  { value: "hp-asc", label: t.productList.sortHpAsc },
  { value: "hp-desc", label: t.productList.sortHpDesc },
];

export default function SortSelect({ hideHp = false }: { hideHp?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const visibleOptions = hideHp ? options.filter((o) => !o.value.startsWith("hp")) : options;

  return (
    <select
      defaultValue={searchParams.get("sort") ?? "newest"}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value === "newest") {
          params.delete("sort");
        } else {
          params.set("sort", e.target.value);
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded border border-black/15 bg-white px-3 py-2 text-sm"
    >
      {visibleOptions.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
