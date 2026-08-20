"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Button } from "@/components/ui/Button";
import { productHref, publicSubcategoryLabel } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import QuoteButton from "@/components/product/QuoteButton";
import { productImageAlt } from "@/lib/product-path";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

export default function FeaturedEquipmentSection({
  products,
  section,
}: {
  products: PublicProduct[];
  section?: HomeSectionRecord;
}) {
  const t = useT();
  const locale = useLocale();
  if (!products.length) return null;
  const title = section?.title || t.home.equipmentCardTitle;
  const body = section?.body || t.home.equipmentCardDesc;
  const ctaLabel = section?.ctaLabel || t.home.viewEquipment;
  const ctaHref = section?.ctaHref || "/makineri-bujqesore";

  return (
    <section className="section-pad bg-ivory text-ink">
      <div className="container-site">
        <SectionIndex index="04" label={section?.eyebrow || t.nav.equipment} tone="light" />
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-tight">{title}</h2>
        {body ? <p className="mt-3 max-w-2xl text-base text-ink/65">{body}</p> : null}
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const cover = coverUrl(product);
            return (
              <StaggerItem key={product.id} className="h-full">
                <article className="group flex h-full flex-col border border-ink/10 bg-warm-white">
                  <Link href={productHref(product, locale)} className="flex flex-1 flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d8]">
                      {cover ? (
                        <Image src={cover} alt={productImageAlt(product)} fill sizes="30vw" className="object-contain p-5" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-ink/35">{t.productDetail.noImage}</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-5 py-5">
                      <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-tractor-red">
                        {publicSubcategoryLabel(product.subcategory, locale) || product.series}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{product.name}</h3>
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold tracking-[0.12em] uppercase">
                        {t.home.viewModel}
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
