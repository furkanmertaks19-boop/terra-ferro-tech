import { Reveal } from "@/components/motion/Reveal";
import type { PublicPageHero } from "@/lib/page-cms";

export default function PageIntro({ page }: { page: PublicPageHero }) {
  return (
    <section className="border-b border-ink/[0.08] bg-ivory pt-28 pb-8 md:pt-32 md:pb-10">
      <div className="container-site">
        <Reveal y={16}>
          {page.eyebrow ? (
            <p className="text-[12px] font-semibold tracking-[0.18em] uppercase text-tractor-red">{page.eyebrow}</p>
          ) : null}
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[0.95] tracking-tight text-ink">
            {page.title}
          </h1>
          {page.description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/60 md:text-lg">{page.description}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
