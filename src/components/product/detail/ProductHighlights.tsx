import type { PublicProduct } from "@/lib/types";
import { productHighlights } from "@/lib/specs";
import { Reveal } from "@/components/motion/Reveal";
import { productContainer } from "./product-shell";
import { t } from "@/lib/i18n";

export default function ProductHighlights({ product }: { product: PublicProduct }) {
  const items = productHighlights(product);
  if (items.length === 0) return null;

  return (
    <section className="border-b border-ink/[0.08] bg-warm-white" aria-labelledby="product-highlights">
      <div className={productContainer}>
        <h2 id="product-highlights" className="sr-only">
          {t.productDetail.highlightsTitle}
        </h2>
        <div className="grid grid-cols-2 divide-ink/[0.08] md:grid-cols-4 md:divide-x">
          {items.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.04} y={12} className="border-b border-ink/[0.08] px-0 py-7 md:border-b-0 md:px-6 md:first:pl-0 md:last:pr-0">
              <p className="text-[11px] tracking-[0.14em] uppercase text-ink/40">{item.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{item.value}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
