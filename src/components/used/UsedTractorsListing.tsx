"use client";

import { Reveal } from "@/components/motion/Reveal";
import UsedTractorCard from "./UsedTractorCard";
import type { PublicUsedTractor } from "@/lib/used-tractors";
import { useT } from "@/components/i18n/LocaleProvider";

export default function UsedTractorsListing({ items }: { items: PublicUsedTractor[] }) {
  const t = useT();
  return (
    <>
      <section className="border-b border-ink/[0.08] bg-ivory pt-28 pb-10 md:pt-32 md:pb-14">
        <div className="container-site">
          <Reveal y={16}>
            <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-tractor-red">{t.nav.usedTractors}</p>
            <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.3rem,5vw,4.1rem)] font-semibold leading-[0.94] tracking-tight text-ink">
              {t.nav.usedTractors}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/60 md:text-lg">{t.usedPage.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory py-10 md:py-14">
        <div className="container-site">
          {items.length === 0 ? (
            <p className="border border-ink/10 bg-warm-white px-6 py-16 text-center text-ink/55">{t.productList.emptyTitle}</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <UsedTractorCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
