"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Button } from "@/components/ui/Button";
import { productHref, productImageAlt } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import QuoteButton from "@/components/product/QuoteButton";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

function specLine(product: PublicProduct, cabin: string, rops: string) {
  const parts: string[] = [];
  if (product.horsePower != null) parts.push(`${product.horsePower} HP`);
  parts.push(product.hasCabin ? cabin : rops);
  if (product.stage) parts.push(product.stage);
  return parts.join(" · ");
}

export default function FeaturedTractorsSection({
  products,
  section,
}: {
  products: PublicProduct[];
  section?: HomeSectionRecord;
}) {
  const t = useT();
  const locale = useLocale();
  if (products.length === 0) return null;
  const title = section?.title || t.home.featuredTitle;
  const body = section?.body || t.home.featuredTractorsBody;
  const ctaLabel = section?.ctaLabel || t.home.viewAllTractors;
  const ctaHref = section?.ctaHref || "/traktoret";
  const eyebrow = section?.eyebrow || t.nav.tractors;

  return (
    <section className="section-pad bg-warm-white text-ink">
      <div className="container-site">
        <SectionIndex index="03" label={eyebrow} tone="light" />
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-tight">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/65">{body}</p>

        <Stagger className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const cover = coverUrl(product);
            const summary = product.shortDescription?.trim();

            return (
              <StaggerItem key={product.id} className="h-full">
                <article className="group flex h-full flex-col border border-ink/10 bg-ivory transition-transform duration-300 ease-out-expo hover:-translate-y-1">
                  <Link href={productHref(product, locale)} className="flex flex-1 flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d8]">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={productImageAlt(product)}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                          className="object-contain p-5 transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="font-display text-sm tracking-[0.18em] uppercase text-ink/30">Terra Ferro Tech</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-5 py-5 md:px-6">
                      {product.series ? (
                        <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-tractor-red">
                          {product.series}
                        </p>
                      ) : null}
                      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{product.name}</h3>
                      <p className="mt-1 text-base text-ink/55">{specLine(product, t.productDetail.cabin, t.productDetail.rops)}</p>
                      {summary ? (
                        <p className="mt-3 line-clamp-2 text-base leading-relaxed text-ink/60">{summary}</p>
                      ) : null}
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold tracking-[0.12em] uppercase">
                        {t.home.viewModel}
                        <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                  <div className="border-t border-ink/10 px-5 py-3 md:px-6">
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
