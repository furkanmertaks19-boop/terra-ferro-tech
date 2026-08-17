"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { HERO_HEIGHT_PX, type PublicPageHero } from "@/lib/page-cms";
import { DURATION, EASE } from "@/lib/motion";

export default function PageHero({ page }: { page: PublicPageHero }) {
  const slides =
    page.heroType === "slider" && page.slides.length > 0
      ? page.slides
      : page.heroImage
        ? [{ id: "hero", image: page.heroImage, mobileImage: page.mobileImage, sortOrder: 0, isActive: true }]
        : [];
  const minHeight = HERO_HEIGHT_PX[page.heroHeight];
  const overlay = Math.min(0.8, Math.max(0, page.overlayOpacity / 100));
  const align =
    page.textPosition === "center" ? "items-center justify-center text-center" : page.textPosition === "left-bottom" ? "items-end" : "items-center";

  return (
    <section className="relative overflow-hidden bg-ink text-warm" style={{ minHeight }}>
      <PageHeroMedia slides={slides} minHeight={minHeight} />
      <div
        className={`absolute inset-0 ${
          page.textPosition === "center"
            ? "bg-gradient-to-t from-ink/70 via-ink/30 to-ink/20"
            : "bg-gradient-to-r from-ink/78 via-ink/35 to-ink/10"
        }`}
        style={{ opacity: Math.max(overlay, slides.length ? 0.25 : 0.55) }}
      />
      <div className={`container-site relative z-[1] flex pb-10 pt-28 md:pb-12 ${align}`} style={{ minHeight }}>
        <HeroCopy page={page} centered={page.textPosition === "center"} />
      </div>
    </section>
  );
}

function HeroCopy({ page, centered }: { page: PublicPageHero; centered: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className={centered ? "max-w-3xl" : "max-w-xl"}>
      {page.eyebrow ? (
        <motion.p
          className="text-[13px] font-medium tracking-[0.18em] uppercase text-warm/70"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.medium, ease: EASE }}
        >
          {page.eyebrow}
        </motion.p>
      ) : null}
      <div className="mt-3 overflow-hidden">
        <motion.h1
          className="font-display text-[clamp(2.2rem,5.2vw,4.6rem)] font-semibold leading-[0.92] tracking-tight text-balance"
          initial={reduce ? false : { y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: DURATION.slow, ease: EASE }}
        >
          {page.title}
        </motion.h1>
      </div>
      {page.description ? (
        <motion.p
          className="mt-4 max-w-lg text-base leading-relaxed text-warm/80 md:text-lg"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.medium, delay: 0.12, ease: EASE }}
        >
          {page.description}
        </motion.p>
      ) : null}
    </div>
  );
}

function PageHeroMedia({
  slides,
  minHeight,
}: {
  slides: Array<{ id: string; image: string; mobileImage: string | null }>;
  minHeight: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const showControls = count > 1;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!showControls || paused || reduce) return;
    const timer = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(timer);
  }, [go, paused, reduce, showControls]);

  useEffect(() => {
    if (!showControls) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, showControls]);

  if (count === 0) return null;
  const current = slides[index] ?? slides[0];

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {slides.map((slide, i) => (
        <motion.div
          key={slide.id}
          className="absolute inset-0"
            initial={reduce ? false : { opacity: i === 0 ? 1 : 0, scale: 1.06 }}
            animate={{ opacity: i === index ? 1 : 0, scale: i === index ? 1 : 1.04 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover object-[center_30%] ${slide.mobileImage ? "hidden md:block" : ""}`}
          />
          {slide.mobileImage ? (
            <Image src={slide.mobileImage} alt="" fill priority={i === 0} sizes="100vw" className="object-cover object-center md:hidden" />
          ) : null}
        </motion.div>
      ))}
      {showControls ? (
        <>
          <button
            type="button"
            aria-label="Paraardhëse"
            className="absolute left-4 top-1/2 z-[2] grid h-10 w-10 -translate-y-1/2 place-items-center border border-warm/20 bg-ink/40 text-warm"
            onClick={() => {
              setPaused(true);
              go(-1);
            }}
          >
            <CaretLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Tjetër"
            className="absolute right-4 top-1/2 z-[2] grid h-10 w-10 -translate-y-1/2 place-items-center border border-warm/20 bg-ink/40 text-warm"
            onClick={() => {
              setPaused(true);
              go(1);
            }}
          >
            <CaretRight size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-warm/15">
            <div className="h-full bg-tractor-red transition-[width] duration-300" style={{ width: `${((index + 1) / count) * 100}%` }} />
          </div>
        </>
      ) : null}
      <span className="sr-only" style={{ minHeight }}>
        {current.image}
      </span>
    </div>
  );
}
