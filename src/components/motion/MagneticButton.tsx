"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

export function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={`inline-flex ${className}`}
      animate={reduce ? undefined : { x: offset.x, y: offset.y }}
      transition={{ duration: DURATION.fast, ease: EASE }}
      onMouseMove={(e) => {
        if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
        setOffset({ x, y });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
}
