"use client";

import { useT } from "@/components/i18n/LocaleProvider";
import type { PublicProduct } from "@/lib/types";
import QuoteButton from "./QuoteButton";

export default function ProductPrice({
  product,
  variant = "card",
}: {
  product: PublicProduct;
  variant?: "card" | "detail";
}) {
  const t = useT();
  if (variant === "card") {
    return <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-tractor-red">{t.productList.requestQuote}</span>;
  }
  return <QuoteButton productId={product.id} productLabel={product.fullTitle} />;
}
