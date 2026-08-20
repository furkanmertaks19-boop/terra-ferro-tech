"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import type { PublicProduct } from "@/lib/types";
import { productHref } from "@/lib/product-path";
import { SectionIndex } from "@/components/ui/SectionIndex";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { pathFor } from "@/lib/i18n/routing";

type Props = {
  seriesOptions: string[];
  hpOptions: number[];
  section?: HomeSectionRecord;
};

export default function ModelFinder({ seriesOptions, hpOptions, section }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useT();
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [series, setSeries] = useState("");
  const [hp, setHp] = useState("");
  const [cabin, setCabin] = useState("");
  const [results, setResults] = useState<PublicProduct[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=TRACTOR`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    }, 220);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (series) params.set("series", series);
    if (cabin) params.set("cabin", cabin);
    if (hp) {
      const n = Number(hp);
      params.set("hpMin", String(n));
      params.set("hpMax", String(n));
    }
    const qs = params.toString();
    const base = pathFor("tractors", locale);
    router.push(qs ? `${base}?${qs}` : base);
  }

  return (
    <section className="relative z-20 -mt-14 md:-mt-20">
      <div className="container-site">
        <form
          onSubmit={applyFilters}
          className="border border-ink/8 bg-warm-white px-5 py-6 text-ink shadow-[0_24px_60px_rgb(16_18_20_/_0.16)] md:px-8 md:py-7"
        >
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionIndex index="02" label={section?.eyebrow || t.home.findModelEyebrow} tone="light" />
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                {section?.title || t.home.findModel}
              </h2>
            </div>
          </div>

          <div className="grid items-end gap-4 lg:grid-cols-12">
            <div ref={boxRef} className="relative lg:col-span-3">
              <label htmlFor="model-search" className="mb-1.5 block text-[13px] tracking-[0.16em] uppercase text-ink/45">
                {t.home.modelLabel}
              </label>
              <input
                id="model-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                placeholder="514 T2, 854e..."
                className="w-full border-0 border-b border-ink/20 bg-transparent py-3 text-base text-ink placeholder:text-ink/35 focus:border-tractor-red focus:outline-none"
                autoComplete="off"
              />
              {open && query.trim().length >= 2 && results.length > 0 && (
                <ul className="absolute z-30 mt-1 w-full border border-ink/10 bg-warm-white shadow-xl">
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-ink/5"
                        onClick={() => router.push(productHref(product, locale))}
                      >
                        <span>{product.name}</span>
                        <span className="text-xs text-ink/45">{product.series}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Select
              className="lg:col-span-3"
              label={t.home.seriesLabel}
              value={series}
              onChange={setSeries}
              options={[
                { value: "", label: t.home.allOptions },
                ...seriesOptions.map((s) => ({ value: s, label: s })),
              ]}
            />

            <Select
              className="lg:col-span-2"
              label="HP"
              value={hp}
              onChange={setHp}
              options={[
                { value: "", label: t.home.allOptions },
                ...hpOptions.map((n) => ({ value: String(n), label: `${n} HP` })),
              ]}
            />

            <Select
              className="lg:col-span-2"
              label={t.productList.cabin}
              value={cabin}
              onChange={setCabin}
              options={[
                { value: "", label: t.home.allOptions },
                { value: "yes", label: t.productDetail.cabin },
                { value: "no", label: t.productDetail.rops },
              ]}
            />

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="btn-wipe inline-flex w-full items-center justify-center gap-2 rounded-[3px] bg-tractor-red px-5 py-3.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white"
              >
                <span className="relative z-[1]">{t.home.findModel}</span>
                <ArrowRight size={14} className="relative z-[1]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] tracking-[0.16em] uppercase text-ink/45">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border-0 border-b border-ink/20 bg-transparent py-3 text-base text-ink focus:border-tractor-red focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value + opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
