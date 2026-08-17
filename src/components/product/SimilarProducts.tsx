import TractorCard from "./TractorCard";
import EquipmentCard from "./EquipmentCard";
import { Category } from "@prisma/client";
import type { PublicProduct } from "@/lib/types";

export default function SimilarProducts({ products }: { products: PublicProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) =>
        product.category === Category.TRACTOR ? (
          <TractorCard key={product.id} product={product} />
        ) : (
          <EquipmentCard key={product.id} product={product} />
        )
      )}
    </div>
  );
}
