import { Suspense } from "react";
import PageHero from "@/components/pages/PageHero";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import TractorFilters from "@/components/filters/TractorFilters";
import ProductGrid from "@/components/product/ProductGrid";
import type { PublicPageHero } from "@/lib/page-cms";
import type { PublicProduct } from "@/lib/types";

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
  return (
    <div className="bg-ivory text-ink">
      <PageHero page={hero} />

      <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-col gap-6 px-4 py-6 md:px-8 lg:flex-row lg:gap-8 lg:py-10">
        <Suspense>
          <TractorFilters seriesOptions={seriesOptions} stageOptions={stageOptions} hideSearch />
        </Suspense>

        <div className="min-w-0 flex-1">
          <h2 className="sr-only">Modelet e traktorëve</h2>
          <p className="mb-3 text-sm text-ink/55">
            {products.length} {products.length === 1 ? "model" : "modele"}
          </p>
          <div className="mb-5">
            <Suspense>
              <CatalogToolbar hidePrice showFilters searchPlaceholder="Kërko traktor..." />
            </Suspense>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} layout="tractors" />
          ) : (
            <div className="border border-ink/10 bg-warm-white px-6 py-16 text-center">
              <p className="font-display text-2xl font-semibold">Aktualisht nuk ka produkte në këtë kategori.</p>
              <p className="mt-3 text-base text-ink/55">Provo të ndryshosh filtrat ose kthehu te lista e plotë.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
