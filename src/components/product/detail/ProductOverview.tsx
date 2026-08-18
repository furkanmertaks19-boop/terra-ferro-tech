import Image from "next/image";
import { galleryUrls, type PublicProduct } from "@/lib/types";
import { looksLikeHtml, type ContentBlock } from "@/lib/admin-content";
import { cinematicGalleryUrl } from "@/lib/cloudinary-media";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { Reveal } from "@/components/motion/Reveal";
import ProductContentBlocks from "@/components/product/ProductContentBlocks";
import { productBody, productContainer, productEyebrow, productSection, productTitle } from "./product-shell";
import { t } from "@/lib/i18n";
import { productImageAlt } from "@/lib/seo";

export default function ProductOverview({ product }: { product: PublicProduct }) {
  const overview = product.description?.trim() || null;
  const blocks = ((product.contentBlocks as ContentBlock[] | undefined) ?? []).filter(
    (block) => block.type !== "features" && block.type !== "highlight",
  );
  if (!overview && blocks.length === 0) return null;

  const html = overview ? looksLikeHtml(overview) : false;
  const image = galleryUrls(product)[1] ?? null;

  return (
    <section className={`${productSection} bg-ivory`} aria-labelledby="product-overview">
      <div className={`${productContainer} grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16`}>
        <Reveal y={14}>
          <p className={productEyebrow}>{t.productDetail.overviewEyebrow}</p>
          <h2 id="product-overview" className={`mt-3 ${productTitle}`}>
            {t.productDetail.descriptionTitle}
          </h2>
          {overview ? (
            html ? (
              <div
                className={`mt-5 ${productBody} [&_a]:text-tractor-red [&_h2]:font-display [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(overview) }}
              />
            ) : (
              <p className={`mt-5 ${productBody}`}>{overview}</p>
            )
          ) : null}
          <ProductContentBlocks blocks={blocks} tone="light" />
        </Reveal>
        {image ? (
          <Reveal delay={0.06} y={14}>
            <div className="relative min-h-[280px] overflow-hidden border border-ink/[0.08] bg-[#ece8de] shadow-[0_18px_40px_-24px_rgba(28,24,18,0.3)] md:min-h-[420px]">
              <Image
                src={cinematicGalleryUrl(image)}
                alt={productImageAlt(product)}
                fill
                className="object-contain p-8"
                sizes="(min-width: 1024px) 42vw, 100vw"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
