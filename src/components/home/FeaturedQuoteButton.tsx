"use client";

import { useQuote } from "@/components/quote/QuoteProvider";

export default function FeaturedQuoteButton({
  productId,
  productLabel,
}: {
  productId: string;
  productLabel: string;
}) {
  const { openQuote } = useQuote();

  return (
    <button
      type="button"
      onClick={() => openQuote({ productId, productLabel })}
      className="text-[12px] font-semibold tracking-[0.12em] uppercase text-ink/55 transition hover:text-tractor-red"
    >
      Kërko Ofertë
    </button>
  );
}
