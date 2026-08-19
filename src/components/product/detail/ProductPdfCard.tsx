"use client";

import { FilePdf } from "@phosphor-icons/react/ssr";
import type { PublicProduct } from "@/lib/types";
import { publicPdfUrl } from "@/components/product/TechnicalPdfCta";
import { useT } from "@/components/i18n/LocaleProvider";
import { productContainer, productSection } from "./product-shell";
import PdfDownloadButton from "./PdfDownloadButton";

export default function ProductPdfCard({
  product }: { product: PublicProduct }) {
  const t = useT();
  const href = publicPdfUrl(product);
  if (!href) return null;

  return (
    <section className={`${productSection} bg-ivory`} aria-labelledby="product-pdf">
      <div className={productContainer}>
        <div className="flex flex-col gap-6 border border-ink/[0.08] bg-warm-white px-6 py-7 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 grid h-11 w-11 place-items-center border border-ink/10 text-tractor-red">
              <FilePdf size={22} />
            </span>
            <div>
              <h2 id="product-pdf" className="font-display text-2xl font-semibold tracking-tight text-ink">
                {t.productDetail.pdfTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">{t.productDetail.pdfBody}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* View: opens PDF in a new browser tab */}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white transition hover:bg-tractor-red-dark"
            >
              {t.productDetail.pdfView} — {product.name}
            </a>
            {/* Download: streams via server route to force browser download */}
            <PdfDownloadButton
              slug={product.slug}
              label={`${t.productDetail.pdfDownload} — ${product.name}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
