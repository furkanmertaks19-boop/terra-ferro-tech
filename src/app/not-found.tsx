import Link from "next/link";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pathFor } from "@/lib/i18n/routing";

export default async function NotFound() {
  const cookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-6 py-24 text-center text-ink">
      <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-tractor-red">404</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">{t.notFound.body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={pathFor("home", locale)}
          className="inline-flex items-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white hover:bg-tractor-red-dark"
        >
          {t.notFound.home}
        </Link>
        <Link
          href={pathFor("tractors", locale)}
          className="inline-flex items-center border border-ink/15 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-ink/40"
        >
          {t.notFound.tractors}
        </Link>
        <Link
          href={pathFor("equipment", locale)}
          className="inline-flex items-center border border-ink/15 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-ink/40"
        >
          {t.nav.equipment}
        </Link>
      </div>
    </main>
  );
}
