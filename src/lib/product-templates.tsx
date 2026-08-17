import ProductDetailPage from "@/components/product/detail/ProductDetailPage";
import type { PublicProduct } from "@/lib/types";
import { ProductViewProvider } from "@/components/product/ProductViewContext";

type DetailProps = { product: PublicProduct; similar: PublicProduct[]; preview?: boolean };

export function ProductDetailView({ product, similar, preview = false }: DetailProps) {
  return (
    <ProductViewProvider preview={preview}>
      <ProductDetailPage product={product} similar={similar} />
    </ProductViewProvider>
  );
}
