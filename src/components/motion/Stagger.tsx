"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE, STAGGER } from "@/lib/motion";

export function Stagger({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: reduce ? 0 : STAGGER, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Stagger className={className} delay={delay}>
      {children}
    </Stagger>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reduce ? 0 : DURATION.slow, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
