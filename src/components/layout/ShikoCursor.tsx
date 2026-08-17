"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

export default function ShikoCursor() {
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduce) return;

    function onMove(e: PointerEvent) {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      setPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      setVisible(Boolean(target?.closest("[data-shiko]")));
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[55] hidden h-16 w-16 items-center justify-center rounded-full border border-warm/25 bg-ink/85 text-[10px] font-semibold tracking-[0.2em] text-warm md:flex"
          style={{ transform: `translate3d(${pos.x - 32}px, ${pos.y - 32}px, 0)` }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: DURATION.fast, ease: EASE }}
        >
          SHIKO
        </motion.div>
      )}
    </AnimatePresence>
  );
}
