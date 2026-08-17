"use client";

import { motion, useReducedMotion } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
