"use client";

import { Category } from "@prisma/client";
import { galleryUrls, type PublicProduct } from "@/lib/types";
import { publicSubcategoryLabel } from "@/lib/product-path";
import { visibleSpecGroups, productHighlights } from "@/lib/specs";
import { publicPdfUrl } from "@/components/product/TechnicalPdfCta";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductBadges from "@/components/product/ProductBadges";
import QuoteButton from "@/components/product/QuoteButton";
import ProductMediaGallery from "./ProductMediaGallery";
import { productContainer } from "./product-shell";
import { useT } from "@/components/i18n/LocaleProvider";
import { productImageAlt } from "@/lib/product-path";

export default function ProductHero({
  product }: { product: PublicProduct }) {
  const t = useT();
  const images = galleryUrls(product);
  const highlights = productHighlights(product);
  const pdf = publicPdfUrl(product);
  const hasSpecs = visibleSpecGroups(product).length > 0;
  const tag =
    product.category === Category.TRACTOR
      ? product.series
      : publicSubcategoryLabel(product.subcategory) || product.series;
  const summary = product.shortDescription?.trim() || null;

  return (
    <header className="border-b border-ink/[0.08] bg-ivory pt-28">
      <div className={`${productContainer} grid gap-10 pb-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14 lg:pb-16`}>
        <div>
          <ProductBreadcrumb category={product.category} name={product.name} tone="light" />
          {tag ? <p className="mt-6 text-[12px] font-semibold tracking-[0.16em] uppercase text-tractor-red">{tag}</p> : null}
          <div className="mt-3">
            <ProductBadges
              isNew={product.isNew}
              isCampaign={product.isCampaign}
              customBadge={product.customBadge}
              customBadgeTone={product.customBadgeTone}
              placement="inline"
            />
          </div>
          <h1 className="mt-3 font-display text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-ink text-balance md:text-5xl">
            {product.name}
          </h1>
          {summary ? <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-ink/65">{summary}</p> : null}

          {highlights.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink/70">
              {highlights.map((item) => (
                <li key={item.label}>
                  <span className="block text-[11px] tracking-[0.12em] uppercase text-ink/40">{item.label}</span>
                  <span className="mt-0.5 block font-medium text-ink">{item.value}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteButton productId={product.id} productLabel={product.fullTitle} />
            {pdf ? (
              <a
                href={pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-ink/18 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink transition hover:border-tractor-red hover:text-tractor-red"
              >
                {t.productDetail.pdfView} — {product.name}
              </a>
            ) : null}
            {images.length > 1 ? (
              <a
                href="#galeria"
                className="inline-flex items-center justify-center px-2 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink/55 transition hover:text-tractor-red"
              >
                {t.productDetail.viewGallery}
              </a>
            ) : null}
            {hasSpecs ? (
              <a
                href="#specifikimet"
                className="inline-flex items-center justify-center px-2 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink/55 transition hover:text-tractor-red"
              >
                {t.productDetail.viewSpecs}
              </a>
            ) : null}
          </div>
        </div>
        <ProductMediaGallery images={images} alt={productImageAlt(product)} heroImageMode={product.heroImageMode} />
      </div>
    </header>
  );
}
