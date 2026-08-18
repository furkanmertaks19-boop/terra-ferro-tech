import { Suspense } from "react";
import Link from "next/link";
import PageHero from "@/components/pages/PageHero";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import ProductGrid from "@/components/product/ProductGrid";
import { EQUIPMENT_GROUPS } from "@/lib/templates";
import type { PublicPageHero } from "@/lib/page-cms";
import type { PublicProduct } from "@/lib/types";

export default function EquipmentListing({
  hero,
  products,
  subcategoryOptions,
  group,
  subcategory,
}: {
  hero: PublicPageHero;
  products: PublicProduct[];
  subcategoryOptions: string[];
  group?: string;
  subcategory?: string;
}) {
  const groups = EQUIPMENT_GROUPS.filter((item) => item.types.some((type) => subcategoryOptions.includes(type)));

  return (
    <div className="bg-ivory text-ink">
      <PageHero page={hero} />

      {groups.length > 0 && (
        <div className="border-y border-ink/10 bg-warm-white">
          <div className="container-site flex gap-6 overflow-x-auto py-4">
            <GroupChip href="/makineri-bujqesore" label="Të gjitha" active={!subcategory && !group} />
            {groups.map((item) => (
              <GroupChip
                key={item.id}
                href={`/makineri-bujqesore?group=${item.id}`}
                label={item.label}
                active={group === item.id || (item.types as readonly string[]).includes(subcategory ?? "")}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-5 py-8 md:px-8 lg:py-10">
        <h2 className="sr-only">Makineri bujqësore</h2>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="text-base text-ink/55">
            {products.length} {products.length === 1 ? "pajisje" : "pajisje"}
          </p>
          <Suspense>
            <CatalogToolbar hideHp hidePrice searchPlaceholder="Kërko makineri..." />
          </Suspense>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} layout="equipment" />
        ) : (
          <div className="border border-ink/10 bg-warm-white px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold">Aktualisht nuk ka produkte në këtë kategori.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`shrink-0 border-b-2 pb-2 text-[13px] font-semibold tracking-[0.12em] uppercase ${
        active ? "border-tractor-red text-tractor-red" : "border-transparent text-ink/55 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
