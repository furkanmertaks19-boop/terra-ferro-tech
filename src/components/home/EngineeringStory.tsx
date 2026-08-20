"use client";

import Image from "next/image";
import { coverUrl, type PublicProduct } from "@/lib/types";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { productHref } from "@/lib/product-path";
import { productImageAlt } from "@/lib/product-path";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

const SPEC_KEYS = [
  { key: "Motori", title: "Motori" },
  { key: "Transmisioni", title: "Transmisioni" },
  { key: "Hidraulika", title: "Hidraulika" },
] as const;

export default function EngineeringStory({ product }: { product: PublicProduct }) {
  const t = useT();
  const locale = useLocale();
  const cover = coverUrl(product);
  const items = [
    product.horsePower != null ? { title: t.spec.power, body: `${product.horsePower} HP` } : null,
    product.specs[SPEC_KEYS[0].key] ? { title: t.spec.engine, body: product.specs[SPEC_KEYS[0].key] } : null,
    product.specs[SPEC_KEYS[1].key] ? { title: t.spec.transmission, body: product.specs[SPEC_KEYS[1].key] } : null,
    product.specs[SPEC_KEYS[2].key] ? { title: t.spec.hydraulics, body: product.specs[SPEC_KEYS[2].key] } : null,
    { title: t.productDetail.cabin, body: product.hasCabin ? t.productDetail.cabin : t.productDetail.rops },
  ].filter((item): item is { title: string; body: string } => Boolean(item?.body));

  if (items.length < 2) return null;

  return (
    <section className="bg-ink py-20 text-warm md:py-28">
      <div className="container-site">
        <SectionIndex index="06" label="Inxhinieri" />
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p className="text-sm tracking-[0.16em] uppercase text-warm/45">{product.series}</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h2>
            <div className="relative mt-8 hidden min-h-[420px] bg-steel lg:block">
              {cover ? (
                <Image
                  src={cover}
                  alt={productImageAlt(product)}
                  fill
                  sizes="40vw"
                  className="object-contain p-8"
                />
              ) : null}
            </div>
            <div className="mt-8 hidden lg:block">
              <Button href={productHref(product, locale)} variant="secondary" arrow>
                {t.home.viewModel}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative mb-10 min-h-[280px] bg-steel lg:hidden">
              {cover ? (
                <Image src={cover} alt={productImageAlt(product)} fill sizes="100vw" className="object-contain p-6" />
              ) : null}
            </div>
            {items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04} y={20}>
                <article className="border-t border-warm/10 py-10">
                  <p className="font-display text-xs tabular-nums text-tractor-red">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{item.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-warm/65 md:text-base">{item.body}</p>
                </article>
              </Reveal>
            ))}
            <div className="lg:hidden">
              <Button href={productHref(product, locale)} variant="secondary" arrow>
                {t.home.viewModel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
