"use client";

import { useQuote } from "@/components/quote/QuoteProvider";
import { useT } from "@/components/i18n/LocaleProvider";

export default function QuoteButton({
  productId,
  usedTractorId,
  productLabel,
  className = "",
  variant = "primary",
}: {
  productId?: string;
  usedTractorId?: string;
  productLabel: string;
  className?: string;
  variant?: "primary" | "ghost" | "gold" | "outline";
}) {
  const { openQuote } = useQuote();
  const t = useT();
  const styles =
    variant === "ghost"
      ? "border border-warm/25 bg-transparent text-warm hover:border-tractor-red hover:text-tractor-red"
      : variant === "outline"
        ? "border border-ink/18 bg-transparent text-ink hover:border-tractor-red hover:text-tractor-red"
        : "bg-tractor-red text-white hover:bg-tractor-red-dark";

  return (
    <button
      type="button"
      onClick={() => openQuote({ productId, usedTractorId, productLabel })}
      className={`inline-flex items-center justify-center px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase transition duration-300 ${styles} ${className}`}
    >
      {t.nav.quote}
    </button>
  );
}
