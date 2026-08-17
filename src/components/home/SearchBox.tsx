"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import type { PublicProduct } from "@/lib/types";
import { productHref } from "@/lib/product-path";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicProduct[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const visibleResults = query.trim().length < 2 ? [] : results;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => visibleResults.length > 0 && setOpen(true)}
        placeholder={t.home.searchPlaceholder}
        className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder-white/50 backdrop-blur focus:border-brand-gold focus:outline-none"
      />

      {open && visibleResults.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-2xl">
          {visibleResults.map((product) => (
            <Link
              key={product.id}
              href={productHref(product)}
              className="flex items-center justify-between px-4 py-3 text-sm text-brand-black hover:bg-neutral-50"
              onClick={() => setOpen(false)}
            >
              <span className="font-medium">{product.name}</span>
              <span className="text-xs text-black/50">{product.series}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
