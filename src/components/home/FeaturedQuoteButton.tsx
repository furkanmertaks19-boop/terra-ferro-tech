"use client";

import { useQuote } from "@/components/quote/QuoteProvider";
import { useT } from "@/components/i18n/LocaleProvider";

export default function FeaturedQuoteButton({
  productId,
  productLabel,
}: {
  productId: string;
  productLabel: string;
}) {
  const { openQuote } = useQuote();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => openQuote({ productId, productLabel })}
      className="text-[12px] font-semibold tracking-[0.12em] uppercase text-ink/55 transition hover:text-tractor-red"
    >
      {t.nav.quote}
    </button>
  );
}
