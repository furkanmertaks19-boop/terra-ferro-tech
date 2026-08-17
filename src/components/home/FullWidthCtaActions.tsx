"use client";

import { useQuote } from "@/components/quote/QuoteProvider";
import { ArrowUpRight } from "@phosphor-icons/react";

export default function FullWidthCtaActions() {
  const { openQuote } = useQuote();

  return (
    <button
      type="button"
      onClick={() => openQuote()}
      className="btn-wipe btn-wipe-dark inline-flex items-center gap-3 rounded-[3px] border border-white/30 px-6 py-3.5 text-[13px] font-semibold tracking-[0.08em] uppercase text-white hover:text-warm"
    >
      <span className="relative z-[1]">Kërko Ofertë</span>
      <ArrowUpRight size={14} className="relative z-[1]" />
    </button>
  );
}
