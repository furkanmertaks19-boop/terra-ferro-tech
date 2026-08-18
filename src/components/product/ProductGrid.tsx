import TractorCard from "@/components/product/TractorCard";
import EquipmentCard from "@/components/product/EquipmentCard";
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
    <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="min-w-0">
          {layout === "equipment" || product.category === Category.EQUIPMENT ? (
            <EquipmentCard product={product} />
          ) : (
            <TractorCard product={product} />
          )}
        </div>
      ))}
    </div>
  );
}
