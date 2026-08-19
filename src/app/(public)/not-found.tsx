"use client";

import LocaleLink from "@/components/i18n/LocaleLink";
import { useT, useLocale } from "@/components/i18n/LocaleProvider";
import { pathFor } from "@/lib/i18n/routing";

export default function PublicNotFound() {
  const t = useT();
  const locale = useLocale();
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-ivory px-6 py-32 text-center text-ink">
      <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-tractor-red">404</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">{t.notFound.body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <LocaleLink
          href={pathFor("home", locale)}
          className="inline-flex items-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white hover:bg-tractor-red-dark"
        >
          {t.notFound.home}
        </LocaleLink>
        <LocaleLink
          href={pathFor("tractors", locale)}
          className="inline-flex items-center border border-ink/15 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-ink/40"
        >
          {t.notFound.tractors}
        </LocaleLink>
      </div>
    </section>
  );
}
