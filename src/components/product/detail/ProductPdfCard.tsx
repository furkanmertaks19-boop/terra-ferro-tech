import { FilePdf } from "@phosphor-icons/react/ssr";
import type { PublicProduct } from "@/lib/types";
import { publicPdfUrl } from "@/components/product/TechnicalPdfCta";
import { t } from "@/lib/i18n";
import { productContainer, productSection } from "./product-shell";

export default function ProductPdfCard({ product }: { product: PublicProduct }) {
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
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white transition hover:bg-tractor-red-dark"
            >
              {t.productDetail.pdfView}
            </a>
            <a
              href={href}
              download
              className="inline-flex items-center justify-center border border-ink/18 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink transition hover:border-tractor-red hover:text-tractor-red"
            >
              {t.productDetail.pdfDownload}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
