"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { DURATION, EASE } from "@/lib/motion";

export function ImageReveal({
  children,
  className = "",
  delay = 0,
  from = "right",
  mode = "inview",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "right" | "left" | "bottom";
  mode?: "inview" | "mount";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.18, margin: "160px 0px" });
  const show = Boolean(reduce) || mode === "mount" || inView;

  const hidden =
    from === "left"
      ? "inset(0 0 0 100%)"
      : from === "bottom"
        ? "inset(100% 0 0 0)"
        : "inset(0 100% 0 0)";

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="absolute inset-0 h-full w-full overflow-hidden"
        initial={{ clipPath: reduce ? "inset(0 0 0 0)" : hidden }}
        animate={{ clipPath: show ? "inset(0 0 0 0)" : hidden }}
        transition={{ duration: reduce ? 0 : DURATION.cinematic, delay: reduce ? 0 : delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
