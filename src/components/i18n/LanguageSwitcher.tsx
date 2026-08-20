"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/routing";
import { useLocale } from "@/components/i18n/LocaleProvider";

function SwitcherInner({ inverted = false }: { inverted?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? "");
  params.delete("_l");
  const suffix = params.toString() ? `?${params.toString()}` : "";

  return (
    <nav aria-label="Language" className="flex items-center gap-0.5">
      {LOCALES.map((item, index) => {
        const href = switchLocalePath(pathname, item, suffix);
        const active = item === locale;
        return (
          <span key={item} className="flex items-center">
            {index > 0 ? (
              <span className={`px-1 text-[11px] ${inverted ? "text-white/35" : "text-ink/25"}`} aria-hidden>
                |
              </span>
            ) : null}
            <a
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
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                router.replace(href);
                router.refresh();
              }}
            >
              {LOCALE_SHORT[item as Locale]}
            </a>
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
