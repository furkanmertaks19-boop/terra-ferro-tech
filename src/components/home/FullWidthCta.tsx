"use client";

import { Button } from "@/components/ui/Button";
import FullWidthCtaActions from "./FullWidthCtaActions";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import { Reveal } from "@/components/motion/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";

export default function FullWidthCta({ section }: { section?: HomeSectionRecord }) {
  const t = useT();
  const title = section?.title || t.home.ctaNeedMachine;
  const body = section?.body || t.home.ctaTalk;
  const ctaHref = section?.ctaHref || "/kontakt";
  const dark = section?.variant === "dark";

  return (
    <section className={`${dark ? "bg-ink" : "bg-tractor-red"} py-12 text-white md:py-16`}>
      <Reveal y={16}>
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[0.95] tracking-tight">
              {title}
            </h2>
            {body ? <p className="mt-3 text-base text-white/80">{body}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
          <FullWidthCtaActions />
            <Button href={ctaHref} variant="secondary">
              {section?.ctaLabel || t.home.contactUs}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
