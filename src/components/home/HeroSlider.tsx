"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { PublicHeroSlide } from "@/lib/slide-types";
import { useQuote } from "@/components/quote/QuoteProvider";
import { HeroSlideCopy, HeroSlideMedia } from "./HeroSlideView";
import { DURATION, EASE } from "@/lib/motion";

export default function HeroSlider({ slides }: { slides: PublicHeroSlide[] }) {
  const { openQuote } = useQuote();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [textKey, setTextKey] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const slide = slides[index];
  const interval = slide?.autoplayDuration ?? 7000;

  const goTo = useCallback(
    (next: number) => {
      if (count < 2) return;
      const wrapped = (next + count) % count;
      setIndex(wrapped);
      setTextKey((k) => k + 1);
    },
    [count]
  );

  const go = useCallback(
    (dir: number) => {
      goTo(index + dir);
    },
    [goTo, index]
  );

  useEffect(() => {
    if (paused || reduce || count < 2) return;
    const id = window.setInterval(() => go(1), interval);
    return () => window.clearInterval(id);
  }, [paused, reduce, count, go, index, interval]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!slide) {
    return (
      <section className="relative flex min-h-[92svh] items-end bg-ink">
        <div className="container-site pb-20 pt-32">
          <p className="text-[13px] tracking-[0.22em] uppercase text-metal">Terra Ferro Tech</p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.9] text-warm">
            Traktorë dhe makineri bujqësore.
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-[92svh] overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
      onPointerDown={(e) => {
        touchX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (touchX.current == null) return;
        const delta = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
      }}
      aria-roledescription="carousel"
      aria-label="Prezantimi kryesor"
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: reduce ? 0.2 : DURATION.cinematic, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0 origin-center will-change-transform"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduce ? 0 : Math.max(8, interval / 1000), ease: "linear" }}
          >
            <HeroSlideMedia slide={slide} priority={index === 0} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${slide.id}-${textKey}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: DURATION.medium, ease: EASE }}
        >
          <HeroSlideCopy slide={slide} onQuote={() => openQuote()} />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-6 md:pb-8">
        <div className="container-site flex items-end justify-between gap-6">
          {count > 1 ? (
            <div className="pointer-events-auto flex items-center gap-4">
              <span className="font-display text-sm tabular-nums text-warm/85">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                {slides.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.title || `Slide ${i + 1}`}
                    aria-current={i === index ? true : undefined}
                    onClick={() => goTo(i)}
                    className={`relative h-px overflow-hidden bg-warm/25 ${i === index ? "w-16" : "w-6"}`}
                  >
                    {i === index && (
                      <motion.span
                        key={`${index}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-tractor-red"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ transformOrigin: "left center", width: "100%" }}
                        transition={{
                          duration: reduce || paused ? 0 : interval / 1000,
                          ease: "linear",
                        }}
                      />
                    )}
                    {i < index && <span className="absolute inset-0 bg-tractor-red/50" />}
                  </button>
                ))}
              </div>
              <span className="font-display text-sm tabular-nums text-warm/40">
                {String(count).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <span />
          )}

          <div className="hidden items-center gap-3 text-[10px] font-medium tracking-[0.24em] uppercase text-warm/55 md:flex">
            <span>Scroll</span>
            <span className="relative h-8 w-px overflow-hidden bg-warm/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-tractor-red"
                animate={reduce ? undefined : { y: [0, 18, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
