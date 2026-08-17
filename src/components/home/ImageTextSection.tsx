import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import type { HomeSectionRecord } from "@/lib/home-section-types";

export default function ImageTextSection({ section }: { section: HomeSectionRecord }) {
  const image = section.image || "/images/home/brand-story.jpg";
  const imageRight = section.variant === "image-right" || section.variant === "editorial";
  const full = section.variant === "full-width";

  if (full) {
    return (
      <section className="relative min-h-[56vh] overflow-hidden bg-ink text-warm">
        <Image src={image} alt={section.title} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative z-10 container-site flex min-h-[56vh] items-end py-16">
          <Reveal className="max-w-xl">
            {section.eyebrow ? <p className="text-[13px] tracking-[0.16em] uppercase text-tractor-red">{section.eyebrow}</p> : null}
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-tight">{section.title}</h2>
            {section.body ? <p className="mt-4 text-base text-warm/75">{section.body}</p> : null}
            {section.ctaHref ? (
              <div className="mt-7">
                <Button href={section.ctaHref} variant="secondary" arrow>
                  {section.ctaLabel || "Shiko"}
                </Button>
              </div>
            ) : null}
          </Reveal>
        </div>
      </section>
    );
  }

  const photo = (
    <ImageReveal className={`relative aspect-[5/4] overflow-hidden ${section.variant === "editorial" ? "lg:col-span-8" : "lg:col-span-7"}`} from={imageRight ? "left" : "right"}>
      <Image src={image} alt={section.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
    </ImageReveal>
  );
  const copy = (
    <Reveal className={section.variant === "editorial" ? "lg:col-span-4" : "lg:col-span-5"} y={20}>
      {section.eyebrow ? <p className="text-[13px] tracking-[0.16em] uppercase text-tractor-red">{section.eyebrow}</p> : null}
      <h2 className="mt-3 font-display text-[clamp(2rem,3.4vw,3rem)] font-semibold tracking-tight">{section.title}</h2>
      {section.body ? <p className="mt-4 text-base leading-relaxed text-ink/65">{section.body}</p> : null}
      {section.ctaHref ? (
        <div className="mt-7">
          <Button href={section.ctaHref} variant="dark" arrow>
            {section.ctaLabel || "Shiko"}
          </Button>
        </div>
      ) : null}
    </Reveal>
  );

  return (
    <section className="bg-warm-white py-20 text-ink md:py-24">
      <div className="container-site grid items-center gap-10 lg:grid-cols-12">
        {imageRight ? (
          <>
            {copy}
            {photo}
          </>
        ) : (
          <>
            {photo}
            {copy}
          </>
        )}
      </div>
    </section>
  );
}
