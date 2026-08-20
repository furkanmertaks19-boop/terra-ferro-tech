"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import QuoteButton from "@/components/product/QuoteButton";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { productHref } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import { productImageAlt } from "@/lib/product-path";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

export default function TechnicalHighlight({
  section,
  product,
}: {
  section: HomeSectionRecord;
  product: PublicProduct | null;
}) {
  const t = useT();
  const locale = useLocale();
  if (!product) return null;
  const cover = coverUrl(product);
  const image = section.image || cover;

  return (
    <section className="bg-white py-20 text-ink md:py-24">
      <div className="container-site grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5" y={18}>
          <p className="text-[13px] tracking-[0.16em] uppercase text-tractor-red">{section.eyebrow || product.series}</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] font-semibold tracking-tight">
            {section.title || product.name}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink/65">
            {section.body || product.shortDescription || t.home.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteButton productId={product.id} productLabel={product.fullTitle} />
            <Button href={section.ctaHref || productHref(product, locale)} variant="dark" arrow>
              {section.ctaLabel || t.home.viewModel}
            </Button>
          </div>
        </Reveal>
        <ImageReveal className="relative aspect-[4/3] bg-[#ece8de] lg:col-span-7" from="right">
          {image ? (
            <Image src={image} alt={productImageAlt(product)} fill sizes="55vw" className="object-contain p-8" />
          ) : null}
        </ImageReveal>
      </div>
    </section>
  );
}
