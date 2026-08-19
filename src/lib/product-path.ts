import { Category } from "@prisma/client";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pathFor, productPath } from "@/lib/i18n/routing";

export function productHref(product: { category: Category; slug: string }, locale: Locale = DEFAULT_LOCALE): string {
  return productPath(product.category, product.slug, locale);
}

export function catalogHref(category: Category, locale: Locale = DEFAULT_LOCALE): string {
  return pathFor(category === Category.TRACTOR ? "tractors" : "equipment", locale);
}

export function publicSubcategoryLabel(value: string | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!value) return "";
  const t = getDictionary(locale);
  if (value === "Other") return t.productList.other;
  if (value === "Field") return t.productList.field;
  if (value === "Orchard") return t.productList.orchard;
  return value;
}

export function productImageAlt(product: { name: string; category: Category }) {
  if (product.category === Category.TRACTOR) return `ArmaTrac ${product.name} traktor`;
  return product.name;
}
