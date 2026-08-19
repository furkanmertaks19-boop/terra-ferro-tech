"use client";

import Link from "next/link";
import type { PublicProduct } from "@/lib/types";
import QuoteButton from "@/components/product/QuoteButton";
import { useT } from "@/components/i18n/LocaleProvider";
import { productContainer, productSection } from "./product-shell";

export default function ProductOfferCta({
  product }: { product: PublicProduct }) {
  const t = useT();
  return (
    <section className={`${productSection} bg-warm-white`} aria-labelledby="product-offer">
      <div className={productContainer}>
        <div className="border border-ink/[0.08] bg-ivory px-6 py-10 md:px-10 md:py-12">
          <h2 id="product-offer" className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink text-balance md:text-4xl">
            {t.productDetail.offerTitle}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/60">{t.productDetail.offerBody}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <QuoteButton productId={product.id} productLabel={product.fullTitle} />
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center border border-ink/18 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink transition hover:border-tractor-red hover:text-tractor-red"
            >
              {t.productDetail.contact}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
