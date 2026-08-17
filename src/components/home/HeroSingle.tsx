import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { TextReveal } from "@/components/motion/TextReveal";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import FullWidthCtaActions from "./FullWidthCtaActions";

export default function HeroSingle({ section }: { section: HomeSectionRecord }) {
  const image = section.image || "/images/home/category-tractors.jpg";
  const centered = section.variant === "center";

  return (
    <section className="relative min-h-[72svh] overflow-hidden bg-ink text-warm">
      <ImageReveal className="absolute inset-0" from="bottom" mode="mount">
        <Image src={image} alt={section.title} fill priority sizes="100vw" className="object-cover" />
      </ImageReveal>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
      <div className={`relative z-10 flex min-h-[72svh] items-end ${centered ? "justify-center text-center" : ""}`}>
        <div className={`container-site pb-16 pt-32 ${centered ? "max-w-3xl" : "max-w-2xl"}`}>
          {section.eyebrow ? (
            <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-tractor-red">{section.eyebrow}</p>
          ) : null}
          <TextReveal as="h1" text={section.title || "Terra Ferro Tech"} mode="mount" className="mt-4 font-display text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-tight" />
          {section.body ? <p className="mt-5 max-w-xl text-base leading-relaxed text-warm/75">{section.body}</p> : null}
          <div className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
            {section.ctaHref ? (
              <Button href={section.ctaHref} variant="secondary" arrow>
                {section.ctaLabel || "Shiko"}
              </Button>
            ) : (
              <FullWidthCtaActions />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
