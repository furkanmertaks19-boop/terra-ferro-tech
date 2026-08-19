"use client";

import { CONTENT_LOCALES, LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export default function LocaleTabs({
  value,
  onChange,
  missing,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
  missing?: Partial<Record<Locale, boolean>>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {LOCALES.map((locale) => {
        const active = value === locale;
        const isMissing = locale !== "sq" && missing?.[locale];
        return (
          <button
            key={locale}
            type="button"
            onClick={() => onChange(locale)}
            className={`rounded-[8px] px-3 py-1.5 text-xs font-semibold tracking-[0.04em] transition ${
              active
                ? "bg-[var(--admin-text)] text-[var(--admin-bg)]"
                : "border border-[var(--admin-border)] text-[var(--admin-text-2)] hover:text-[var(--admin-text)]"
            }`}
          >
            {LOCALE_LABELS[locale]}
            {locale === "sq" ? (
              <span className="ml-1.5 opacity-70">✓</span>
            ) : isMissing ? (
              <span className="ml-1.5 text-amber-400">!</span>
            ) : (
              <span className="ml-1.5 opacity-70">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LocaleStatus({ i18nReady }: { i18nReady: { en: boolean; tr: boolean } }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.06em] uppercase text-[var(--admin-muted)]">
      <span>SQ ✓</span>
      <span className={i18nReady.en ? "" : "text-amber-400"}>EN {i18nReady.en ? "✓" : "!"}</span>
      <span className={i18nReady.tr ? "" : "text-amber-400"}>TR {i18nReady.tr ? "✓" : "!"}</span>
    </span>
  );
}

export function missingHint(locale: Locale) {
  if (locale === "en") return "İngilizce çeviri eksik — boş bırakılırsa Arnavutça gösterilir.";
  if (locale === "tr") return "Türkçe çeviri eksik — boş bırakılırsa Arnavutça gösterilir.";
  return "";
}

export { CONTENT_LOCALES };
