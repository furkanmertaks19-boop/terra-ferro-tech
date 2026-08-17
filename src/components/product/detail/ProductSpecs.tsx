import type { PublicProduct } from "@/lib/types";
import { visibleSpecGroups } from "@/lib/specs";
import { Reveal } from "@/components/motion/Reveal";
import { productContainer, productEyebrow, productSection, productTitle } from "./product-shell";
import { t } from "@/lib/i18n";

export default function ProductSpecs({ product }: { product: PublicProduct }) {
  const groups = visibleSpecGroups(product);
  if (groups.length === 0) return null;

  return (
    <section id="specifikimet" className={`${productSection} scroll-mt-28 bg-warm-white`} aria-labelledby="product-specs">
      <div className={productContainer}>
        <p className={productEyebrow}>{t.productDetail.specsTitle}</p>
        <h2 id="product-specs" className={`mt-3 ${productTitle}`}>
          {t.productDetail.specsTitle}
        </h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {groups.map((group, index) => (
            <Reveal key={group.title} delay={index * 0.04} y={12}>
              <div className="border border-ink/[0.08] bg-ivory">
                <h3 className="border-b border-ink/[0.08] px-5 py-3 font-display text-lg font-semibold tracking-tight">
                  {group.title}
                </h3>
                <dl>
                  {group.rows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-ink/[0.06] px-5 py-3 last:border-b-0"
                    >
                      <dt className="text-sm text-ink/50">{row.key}</dt>
                      <dd className="text-right text-sm font-medium text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
