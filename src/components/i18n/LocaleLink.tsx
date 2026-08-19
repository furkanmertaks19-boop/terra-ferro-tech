"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { localizeHref } from "@/lib/i18n/routing";

function shouldLocalize(href: string) {
  if (!href.startsWith("/")) return false;
  if (href.startsWith("/admin") || href.startsWith("/api") || href.startsWith("/#")) return false;
  return true;
}

export default function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const raw = typeof href === "string" ? href : href.toString();
  const next = shouldLocalize(raw) ? localizeHref(raw, locale) : href;
  return <Link href={next} {...props} />;
}
