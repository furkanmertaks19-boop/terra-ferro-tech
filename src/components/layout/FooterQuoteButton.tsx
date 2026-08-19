"use client";

import { useQuote } from "@/components/quote/QuoteProvider";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useT } from "@/components/i18n/LocaleProvider";

export default function FooterQuoteButton() {
  const { openQuote } = useQuote();
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => openQuote()}
      className="btn-wipe inline-flex items-center gap-2 rounded-[3px] bg-tractor-red px-5 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase text-white"
    >
      <span className="relative z-[1]">{t.nav.quote}</span>
      <ArrowUpRight size={14} className="relative z-[1]" />
    </button>
  );
}
