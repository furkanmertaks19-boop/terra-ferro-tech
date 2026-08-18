import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { TextReveal } from "@/components/motion/TextReveal";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { ABOUT } from "@/lib/site-content";
import type { HomeSectionRecord } from "@/lib/home-section-types";

export default function BrandStory({ section }: { section?: HomeSectionRecord }) {
  const imageRight = section?.variant === "image-right";
  const image = section?.image || "/images/home/brand-story.jpg";
  const title = section?.title || ABOUT.headline;
  const body = section?.body || ABOUT.body;
  const eyebrow = section?.eyebrow || "Terra Ferro Tech";
  const features = section?.config.features?.length
    ? section.config.features
    : ABOUT.values.map((item) => ({ title: item.title, body: item.body }));
  const ctaLabel = section?.ctaLabel || "Rreth Nesh";
  const ctaHref = section?.ctaHref || "/rreth-nesh";

  const photo = (
    <ImageReveal className="relative aspect-[16/11] overflow-hidden bg-[#ece8de] lg:col-span-7" from={imageRight ? "left" : "right"}>
      <ParallaxImage amount={18} className="absolute inset-0">
        <Image src={image} alt={title} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover scale-[1.08]" />
      </ParallaxImage>
    </ImageReveal>
  );

  const copy = (
    <Reveal className="lg:col-span-5" y={22}>
      <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-tractor-red">{eyebrow}</p>
      <TextReveal as="h2" text={title} className="mt-3 font-display text-[clamp(2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] tracking-tight text-ink" />
      <p className="mt-4 text-base leading-relaxed text-ink/65">{body}</p>
      <Stagger className="mt-6 space-y-4">
        {features.slice(0, 3).map((item) => (
          <StaggerItem key={item.title}>
            <div className="border-t border-ink/10 pt-4">
              <p className="text-base font-medium text-ink">{item.title}</p>
              <p className="mt-1 text-base text-ink/55">{item.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-7">
        <Button href={ctaHref} variant="dark" arrow>
          {ctaLabel}
        </Button>
      </div>
    </Reveal>
  );

  return (
    <section className="overflow-hidden bg-ivory py-[88px] text-ink md:py-[104px]">
      <div className="container-site">
        <SectionIndex index="06" label="Rreth Nesh" tone="light" />
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
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
      </div>
    </section>
  );
}
