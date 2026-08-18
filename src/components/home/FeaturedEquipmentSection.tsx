import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Button } from "@/components/ui/Button";
import { productHref, publicSubcategoryLabel } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import QuoteButton from "@/components/product/QuoteButton";
import { productImageAlt } from "@/lib/seo";

export default function FeaturedEquipmentSection({
  products,
  section,
}: {
  products: PublicProduct[];
  section?: HomeSectionRecord;
}) {
  if (!products.length) return null;
  const title = section?.title || "Makineri të zgjedhura";
  const body = section?.body || "Pajisje për punimin e tokës, plehrimin dhe mbrojtjen e kulturave.";
  const ctaLabel = section?.ctaLabel || "Shiko Makineritë";
  const ctaHref = section?.ctaHref || "/makineri-bujqesore";

  return (
    <section className="section-pad bg-ivory text-ink">
      <div className="container-site">
        <SectionIndex index="04" label={section?.eyebrow || "Makineri Bujqësore"} tone="light" />
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-tight">{title}</h2>
        {body ? <p className="mt-3 max-w-2xl text-base text-ink/65">{body}</p> : null}
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const cover = coverUrl(product);
            return (
              <StaggerItem key={product.id} className="h-full">
                <article className="group flex h-full flex-col border border-ink/10 bg-warm-white">
                  <Link href={productHref(product)} className="flex flex-1 flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d8]">
                      {cover ? (
                        <Image src={cover} alt={productImageAlt(product)} fill sizes="30vw" className="object-contain p-5" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-ink/35">Imazhi së shpejti</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-5 py-5">
                      <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-tractor-red">
                        {publicSubcategoryLabel(product.subcategory) || product.series}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{product.name}</h3>
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold tracking-[0.12em] uppercase">
                        Shiko Modelin
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </Link>
                  <div className="border-t border-ink/10 px-5 py-3">
                    <QuoteButton productId={product.id} productLabel={product.fullTitle} className="w-full" />
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
        <div className="mt-8">
          <Button href={ctaHref} variant="dark" arrow>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
