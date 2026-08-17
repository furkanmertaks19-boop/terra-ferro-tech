import type { PublicProduct } from "@/lib/types";

export function publicPdfUrl(product: Pick<PublicProduct, "technicalPdfUrl">) {
  return product.technicalPdfUrl?.trim() || null;
}
