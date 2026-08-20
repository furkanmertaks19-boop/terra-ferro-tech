"use client";

import { Suspense } from "react";
import PageHero from "@/components/pages/PageHero";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import TractorFilters from "@/components/filters/TractorFilters";
import ProductGrid from "@/components/product/ProductGrid";
import type { PublicPageHero } from "@/lib/page-cms";
import type { PublicProduct } from "@/lib/types";
import { useT } from "@/components/i18n/LocaleProvider";

export default function TractorsListing({
  hero,
  products,
  seriesOptions,
  stageOptions,
}: {
  hero: PublicPageHero;
  products: PublicProduct[];
  seriesOptions: string[];
  stageOptions: string[];
}) {
  const t = useT();
  return (
    <div className="bg-ivory text-ink">
      <PageHero page={hero} />

      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-col gap-6 px-4 py-6 md:px-8 lg:flex-row lg:gap-8 lg:py-10">
        <Suspense>
          <TractorFilters seriesOptions={seriesOptions} stageOptions={stageOptions} hideSearch />
        </Suspense>

        <div className="min-w-0 flex-1">
          <h2 className="sr-only">{t.productList.tractorsTitle}</h2>
          <p className="mb-3 text-sm text-ink/55">
            {products.length} {products.length === 1 ? t.productList.model : t.productList.models}
          </p>
          <div className="mb-5">
            <Suspense>
              <CatalogToolbar hidePrice showFilters searchPlaceholder={t.productList.searchTractors} />
            </Suspense>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="border border-ink/10 bg-warm-white px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold">{t.productList.emptyTitle}</p>
              <p className="mt-2 text-sm text-ink/55">{t.productList.emptyBody}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
