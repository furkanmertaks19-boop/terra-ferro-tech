"use client";

import { useQuote } from "@/components/quote/QuoteProvider";

export default function QuoteButton({
  productId,
  productLabel,
  className = "",
  variant = "primary",
}: {
  productId: string;
  productLabel: string;
  className?: string;
  variant?: "primary" | "ghost" | "gold" | "outline";
}) {
  const { openQuote } = useQuote();
  const styles =
    variant === "ghost"
      ? "border border-warm/25 bg-transparent text-warm hover:border-tractor-red hover:text-tractor-red"
      : variant === "outline"
        ? "border border-ink/18 bg-transparent text-ink hover:border-tractor-red hover:text-tractor-red"
        : "bg-tractor-red text-white hover:bg-tractor-red-dark";

  return (
    <button
      type="button"
      onClick={() => openQuote({ productId, productLabel })}
      className={`inline-flex items-center justify-center px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase transition duration-300 ${styles} ${className}`}
    >
      Kërko Ofertë
    </button>
  );
}
