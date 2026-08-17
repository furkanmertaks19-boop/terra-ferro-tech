"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE, STAGGER } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

export function TextReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  mode = "inview",
}: {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  mode?: "inview" | "mount";
}) {
  const reduce = useReducedMotion();
  const words = text.trim().split(/\s+/);
  const duration = reduce ? 0 : DURATION.slow;

  if (words.length === 0) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom py-[0.12em] pr-[0.28em] -my-[0.08em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: "110%" }}
            {...(mode === "mount"
              ? { animate: { y: "0%" } }
              : { whileInView: { y: "0%" }, viewport: { once: true, amount: 0.4 } })}
            transition={{ duration, delay: reduce ? 0 : delay + i * STAGGER, ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function LineReveal({
  lines,
  as: Tag = "h1",
  className = "",
  delay = 0,
}: {
  lines: string[];
  as?: Tag;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const duration = reduce ? 0 : DURATION.slow;

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="block overflow-hidden py-[0.14em] -my-[0.08em]">
          <motion.span
            className="block will-change-transform"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration, delay: reduce ? 0 : delay + i * 0.08, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
