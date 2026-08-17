import TractorCard from "./TractorCard";
import EquipmentCard from "./EquipmentCard";
import { Category } from "@prisma/client";
import type { PublicProduct } from "@/lib/types";
import { t } from "@/lib/i18n";

export default function RelatedProducts({ products }: { products: PublicProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-ink/[0.08] bg-ivory py-14 text-ink md:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{t.productDetail.similarTitle}</h2>
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product, i) =>
            product.category === Category.EQUIPMENT ? (
              <EquipmentCard key={product.id} product={product} index={i} />
            ) : (
              <TractorCard key={product.id} product={product} index={i} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
