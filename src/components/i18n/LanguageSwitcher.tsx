"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n/config";
import { localeFromPathname, switchLocalePath } from "@/lib/i18n/routing";
import { useLocale } from "@/components/i18n/LocaleProvider";

function SwitcherInner({ inverted = false }: { inverted?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const current = localeFromPathname(pathname) || locale;
  const search = searchParams?.toString();
  const suffix = search ? `?${search}` : "";

  return (
    <nav aria-label="Language" className="flex items-center gap-0.5">
      {LOCALES.map((item, index) => {
        const href = switchLocalePath(pathname, item, suffix);
        const active = item === current;
        return (
          <span key={item} className="flex items-center">
            {index > 0 ? (
              <span className={`px-1 text-[11px] ${inverted ? "text-white/35" : "text-ink/25"}`} aria-hidden>
                |
              </span>
            ) : null}
            <Link
              href={href}
              hrefLang={item}
              lang={item}
              aria-current={active ? "true" : undefined}
              className={`text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-[220ms] ${
                active
                  ? inverted
                    ? "text-white"
                    : "text-tractor-red"
                  : inverted
                    ? "text-white/70 hover:text-white"
                    : "text-ink/50 hover:text-ink"
              }`}
            >
              {LOCALE_SHORT[item as Locale]}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

export default function LanguageSwitcher({ inverted = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <Suspense fallback={<span className="inline-block min-w-[72px] text-[11px] tracking-[0.14em] uppercase opacity-50">SQ | EN | TR</span>}>
      <SwitcherInner inverted={inverted} />
    </Suspense>
  );
}
