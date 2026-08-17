import TractorCard from "@/components/product/TractorCard";
import EquipmentCard from "@/components/product/EquipmentCard";
import ProductDetailPage from "@/components/product/detail/ProductDetailPage";
import type { PublicProduct } from "@/lib/types";
import type { Theme } from "@prisma/client";

type DetailProps = { product: PublicProduct; similar: PublicProduct[] };

export const themeRegistry: Record<
  Theme,
  {
    Card: React.ComponentType<{ product: PublicProduct }>;
    Detail: React.ComponentType<DetailProps>;
  }
> = {
  TRACTOR_THEME: { Card: TractorCard, Detail: ProductDetailPage },
  EQUIPMENT_THEME: { Card: EquipmentCard, Detail: ProductDetailPage },
};
