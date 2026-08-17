"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const recover = retry ?? reset ?? (() => window.location.reload());

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-warm px-6 text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold">Përmbajtja nuk mund të ngarkohet për momentin.</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">Ju lutemi provoni përsëri.</p>
        <button
          type="button"
          onClick={() => recover()}
          className="mt-8 bg-brand-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white"
        >
          Provo përsëri
        </button>
      </div>
    </div>
  );
}
