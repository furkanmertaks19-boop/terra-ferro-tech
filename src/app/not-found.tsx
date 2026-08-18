import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ivory px-6 py-24 text-center text-ink">
      <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-tractor-red">404</p>
      <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">Faqja nuk u gjet</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">
        Lidhja mund të jetë e gabuar ose faqja nuk ekziston më. Kthehuni te {SITE_NAME} ose shikoni produktet.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-white hover:bg-tractor-red-dark"
        >
          Kthehu në Ballinë
        </Link>
        <Link
          href="/traktoret"
          className="inline-flex items-center border border-ink/15 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-ink/40"
        >
          Shiko traktorët
        </Link>
        <Link
          href="/makineri-bujqesore"
          className="inline-flex items-center border border-ink/15 px-5 py-3 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:border-ink/40"
        >
          Makineri bujqësore
        </Link>
      </div>
    </main>
  );
}
