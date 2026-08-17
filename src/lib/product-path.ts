import { Category } from "@prisma/client";

export function productHref(product: { category: Category; slug: string }): string {
  return product.category === Category.TRACTOR
    ? `/traktoret/${product.slug}`
    : `/makineri-bujqesore/${product.slug}`;
}

export function catalogHref(category: Category): string {
  return category === Category.TRACTOR ? "/traktoret" : "/makineri-bujqesore";
}

export function publicSubcategoryLabel(value: string | null | undefined): string {
  if (!value) return "";
  if (value === "Other") return "Të tjera";
  if (value === "Field") return "Përdorim në fushë";
  if (value === "Orchard") return "Pemishte";
  return value;
}
