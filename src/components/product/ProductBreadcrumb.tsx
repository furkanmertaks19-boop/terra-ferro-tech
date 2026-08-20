"use client";

import LocaleLink from "@/components/i18n/LocaleLink";
import { catalogHref } from "@/lib/product-path";
import { Category } from "@prisma/client";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { pathFor } from "@/lib/i18n/routing";

export default function ProductBreadcrumb({
  category,
  name,
  tone = "dark",
}: {
  category: Category;
  name: string;
  tone?: "dark" | "light";
}) {
  const t = useT();
  const locale = useLocale();
  const catalog = category === Category.TRACTOR ? t.nav.tractors : t.nav.equipment;
  const muted = tone === "light" ? "text-ink/45" : "text-warm/50";
  const hover = tone === "light" ? "hover:text-ink" : "hover:text-tractor-red";
  const current = tone === "light" ? "text-ink" : "text-warm/80";

  return (
    <nav aria-label={t.footer.navigation} className={`text-[12px] tracking-[0.04em] ${muted}`}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <LocaleLink href={pathFor("home", locale)} className={hover}>
            {t.nav.home}
          </LocaleLink>
        </li>
        <li aria-hidden>/</li>
        <li>
          <LocaleLink href={catalogHref(category, locale)} className={hover}>
            {catalog}
          </LocaleLink>
        </li>
        <li aria-hidden>/</li>
        <li className={current}>{name}</li>
      </ol>
    </nav>
  );
}
