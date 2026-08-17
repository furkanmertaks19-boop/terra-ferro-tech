import Image from "next/image";
import Link from "next/link";
import type { PublicHeroSlide, SlidePosition } from "@/lib/slide-types";
import { isQuoteAction } from "@/lib/slide-types";
import { LineReveal } from "@/components/motion/TextReveal";

const POSITION: Record<SlidePosition, string> = {
  "left-center": "items-center justify-start text-left",
  "left-bottom": "items-end justify-start text-left md:pb-28",
  center: "items-center justify-center text-center",
  "right-center": "items-center justify-end text-right",
};

export function HeroSlideMedia({ slide, priority }: { slide: PublicHeroSlide; priority?: boolean }) {
  const overlay = Math.min(0.28, Math.max(0.08, (slide.overlayOpacity / 100) * 0.38));

  return (
    <div className="absolute inset-0">
      <Image
        src={slide.desktopImage}
        alt={slide.title}
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover object-[center_38%] md:object-center ${slide.mobileImage ? "hidden md:block" : ""}`}
      />
      {slide.mobileImage ? (
        <Image
          src={slide.mobileImage}
          alt={slide.title}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-[center_38%] md:hidden"
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(90% 70% at 8% 58%, rgb(16 18 20 / ${overlay + 0.18}) 0%, transparent 62%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/18" />
    </div>
  );
}

const PRIMARY_CTA =
  "btn-wipe inline-flex items-center rounded-[3px] bg-tractor-red px-5 py-3 text-[12px] font-semibold tracking-[0.08em] uppercase text-white sm:px-6 sm:py-3.5 sm:text-[13px]";
const SECONDARY_CTA =
  "btn-wipe btn-wipe-red inline-flex items-center rounded-[3px] border border-warm/40 px-5 py-3 text-[12px] font-semibold tracking-[0.08em] uppercase text-warm hover:text-white sm:px-6 sm:py-3.5 sm:text-[13px]";

function titleLines(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 4) return [title];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

export function HeroSlideCopy({
  slide,
  compact,
  onQuote,
}: {
  slide: PublicHeroSlide;
  compact?: boolean;
  onQuote?: () => void;
}) {
  const copyMax =
    slide.contentPosition === "center" ? "mx-auto" : slide.contentPosition === "right-center" ? "ml-auto" : "";
  const lines = titleLines(slide.title);

  return (
    <div
      className={`relative z-10 flex ${compact ? "h-full px-8 py-10" : "min-h-[92svh] pb-32 pt-28 md:pb-24"} ${POSITION[slide.contentPosition]}`}
    >
      <div className={compact ? "w-full" : "container-site w-full"}>
        <div className={`max-w-3xl ${copyMax}`}>
          {slide.eyebrow ? (
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-metal md:text-[12px]">{slide.eyebrow}</p>
          ) : null}
          {compact ? (
            <h1 className="mt-4 font-display text-3xl font-semibold leading-[0.92] tracking-tight text-warm md:text-5xl">
              {slide.title}
            </h1>
          ) : (
            <LineReveal
              as="h1"
              lines={lines}
              delay={0.08}
              className="mt-4 font-display text-[clamp(2.6rem,7vw,6.4rem)] font-semibold leading-[0.9] tracking-tight text-warm"
            />
          )}
          {slide.subtitle ? (
            <p className={`mt-6 max-w-md leading-relaxed text-warm/78 ${copyMax} ${compact ? "text-sm" : "text-base md:text-lg"}`}>
              {slide.subtitle}
            </p>
          ) : null}
          <div
            className={`mt-8 flex flex-wrap gap-3 ${
              slide.contentPosition === "center"
                ? "justify-center"
                : slide.contentPosition === "right-center"
                  ? "justify-end"
                  : ""
            }`}
          >
            {slide.primaryButtonText && slide.primaryButtonUrl ? (
              isQuoteAction(slide.primaryButtonUrl) ? (
                <button type="button" onClick={onQuote} className={PRIMARY_CTA}>
                  <span className="relative z-[1]">{slide.primaryButtonText}</span>
                </button>
              ) : (
                <Link href={slide.primaryButtonUrl} className={PRIMARY_CTA}>
                  <span className="relative z-[1]">{slide.primaryButtonText}</span>
                </Link>
              )
            ) : null}
            {slide.secondaryButtonText && slide.secondaryButtonUrl ? (
              isQuoteAction(slide.secondaryButtonUrl) ? (
                <button type="button" onClick={onQuote} className={SECONDARY_CTA}>
                  <span className="relative z-[1]">{slide.secondaryButtonText}</span>
                </button>
              ) : (
                <Link href={slide.secondaryButtonUrl} className={SECONDARY_CTA}>
                  <span className="relative z-[1]">{slide.secondaryButtonText}</span>
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSlideView({
  slide,
  priority,
  compact,
  onQuote,
}: {
  slide: PublicHeroSlide;
  priority?: boolean;
  compact?: boolean;
  onQuote?: () => void;
}) {
  return (
    <div className={`relative overflow-hidden bg-ink ${compact ? "h-full min-h-[280px]" : "min-h-[92svh]"}`}>
      <HeroSlideMedia slide={slide} priority={priority} />
      <HeroSlideCopy slide={slide} compact={compact} onQuote={onQuote} />
    </div>
  );
}
