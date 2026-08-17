import type { PublicProduct } from "@/lib/types";
import type { ContentBlock } from "@/lib/admin-content";
import { Reveal } from "@/components/motion/Reveal";
import { productContainer, productEyebrow, productSection, productTitle } from "./product-shell";
import { t } from "@/lib/i18n";

export default function ProductFeatureList({ product }: { product: PublicProduct }) {
  const blocks = ((product.contentBlocks as ContentBlock[] | undefined) ?? []).filter(
    (block) => block.type === "features" || block.type === "highlight",
  );
  if (blocks.length === 0) return null;

  const items = blocks.flatMap((block) => {
    if (block.type === "highlight" && block.title) return [{ id: block.id, title: block.title, body: block.body }];
    if (block.type === "features") return block.items.filter((item) => item.title);
    return [];
  });
  if (items.length === 0) return null;

  return (
    <section className={`${productSection} bg-ivory`} aria-labelledby="product-features">
      <div className={productContainer}>
        <p className={productEyebrow}>{t.productDetail.featuresTitle}</p>
        <h2 id="product-features" className={`mt-3 ${productTitle}`}>
          {t.productDetail.featuresTitle}
        </h2>
        <div className="mt-8 divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.03} y={10} className="grid gap-2 py-5 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] md:gap-10">
              <h3 className="font-display text-xl font-semibold tracking-tight text-ink">{item.title}</h3>
              {item.body ? <p className="text-base leading-relaxed text-ink/65">{item.body}</p> : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
