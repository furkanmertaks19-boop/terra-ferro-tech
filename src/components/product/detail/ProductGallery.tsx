import { galleryUrls, type PublicProduct } from "@/lib/types";
import { t } from "@/lib/i18n";
import { productImageAlt } from "@/lib/seo";
import ProductMediaGallery from "./ProductMediaGallery";
import { productContainer, productEyebrow, productSection, productTitle } from "./product-shell";

export default function ProductGallerySection({ product }: { product: PublicProduct }) {
  const images = galleryUrls(product);
  if (images.length < 2) return null;

  return (
    <section id="galeria" className={`${productSection} scroll-mt-28 bg-warm-white`} aria-labelledby="product-gallery">
      <div className={productContainer}>
        <p className={productEyebrow}>{t.productDetail.galleryTitle}</p>
        <h2 id="product-gallery" className={`mt-3 ${productTitle}`}>
          {t.productDetail.galleryTitle}
        </h2>
        <div className="mt-8">
          <ProductMediaGallery images={images} alt={productImageAlt(product)} heroImageMode={product.heroImageMode} layout="section" />
        </div>
      </div>
    </section>
  );
}
