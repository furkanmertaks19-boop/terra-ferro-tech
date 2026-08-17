import TractorCard from "@/components/product/TractorCard";
import EquipmentCard from "@/components/product/EquipmentCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Category } from "@prisma/client";
import type { PublicProduct } from "@/lib/types";

export default function ProductGrid({
  products,
  layout = "tractors",
}: {
  products: PublicProduct[];
  layout?: "tractors" | "equipment";
}) {
  return (
    <Stagger className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full">
          {layout === "equipment" || product.category === Category.EQUIPMENT ? (
            <EquipmentCard product={product} />
          ) : (
            <TractorCard product={product} />
          )}
        </StaggerItem>
      ))}
    </Stagger>
  );
}
