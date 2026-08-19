"use client";

import { useEffect } from "react";
import { useT } from "@/components/i18n/LocaleProvider";

export default function PublicError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  const recover = retry ?? reset ?? (() => window.location.reload());

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-warm px-6 text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold">{t.error.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">{t.error.body}</p>
        <button
          type="button"
          onClick={() => recover()}
          className="mt-8 bg-brand-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white"
        >
          {t.error.retry}
        </button>
      </div>
    </div>
  );
}
