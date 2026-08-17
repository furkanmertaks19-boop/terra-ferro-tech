"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TRUST_STATS } from "@/lib/site-content";

export default function TrustStats() {
  if (!TRUST_STATS.enabled || TRUST_STATS.items.length === 0) return null;

  return (
    <section className="border-y border-warm/10 bg-ink py-16">
      <div className="container-site grid gap-10 sm:grid-cols-3">
        {TRUST_STATS.items.map((item) => (
          <Stat key={item.label} value={item.value} suffix={item.suffix} label={item.label} />
        ))}
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const duration = 900;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * t));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce, value]);

  return (
    <div ref={ref}>
      <p className="font-display text-5xl font-semibold tabular-nums text-tractor-red">
        {shown}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-warm/60">{label}</p>
    </div>
  );
}
