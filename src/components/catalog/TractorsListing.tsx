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

      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:py-10">
        <Suspense>
          <TractorFilters seriesOptions={seriesOptions} stageOptions={stageOptions} hideSearch />
        </Suspense>

        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-base text-ink/55">
                {products.length} {products.length === 1 ? "model" : "modele"}
              </p>
            </div>
            <Suspense>
              <CatalogToolbar hidePrice searchPlaceholder="Kërko traktor..." />
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
