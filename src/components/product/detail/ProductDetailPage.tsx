import type { PublicProduct } from "@/lib/types";
import StickyOfferBar from "@/components/product/StickyOfferBar";
import RelatedProducts from "@/components/product/RelatedProducts";
import ProductHero from "./ProductHero";
import ProductHighlights from "./ProductHighlights";
import ProductOverview from "./ProductOverview";
import ProductSpecs from "./ProductSpecs";
import ProductFeatureList from "./ProductFeatureList";
import ProductGallerySection from "./ProductGallery";
import ProductPdfCard from "./ProductPdfCard";
import ProductOfferCta from "./ProductOfferCta";
import JsonLd from "@/components/seo/JsonLd";
import { productBreadcrumbJsonLd, productJsonLd } from "@/lib/seo";

export default function ProductDetailPage({
  product,
  similar,
}: {
  product: PublicProduct;
  similar: PublicProduct[];
}) {
  return (
    <article className="bg-ivory pb-20 text-ink lg:pb-0">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={productBreadcrumbJsonLd(product)} />
      <ProductHero product={product} />
      <ProductHighlights product={product} />
      <ProductOverview product={product} />
      <ProductSpecs product={product} />
      <ProductFeatureList product={product} />
      <ProductGallerySection product={product} />
      <ProductPdfCard product={product} />
      <RelatedProducts products={similar} />
      <ProductOfferCta product={product} />
      <StickyOfferBar productId={product.id} productLabel={product.fullTitle} />
    </article>
  );
}
