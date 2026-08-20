"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SERVICES } from "@/lib/site-content";
import { servicesList } from "@/lib/site-content";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { DURATION, EASE } from "@/lib/motion";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

const SERVICE_IMAGES = [
  "/images/home/brand-story.jpg",
  "/images/home/category-tractors.jpg",
  "/images/home/category-equipment.jpg",
  "/images/home/cta-field.jpg",
  "/images/home/brand-story.jpg",
];

export default function ServicesSection({ section }: { section?: HomeSectionRecord }) {
  const t = useT();
  const locale = useLocale();
  const services = servicesList(locale);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const image = SERVICE_IMAGES[active] ?? SERVICE_IMAGES[0];
  const title = section?.title || t.home.servicesHeadline;
  const eyebrow = section?.eyebrow || t.nav.services;

  return (
    <section id="sherbimet" className="section-pad bg-white text-ink">
      <div className="container-site">
        <SectionIndex index="05" label={eyebrow} tone="light" />
        <div className="mt-6 grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] font-semibold tracking-tight">
              {title}
            </h2>
            <div className="mt-6">
              {services.map((service, i) => (
                <button
                  key={service.title}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`flex w-full items-start gap-4 border-b border-ink/10 border-l-2 py-4 pl-3 text-left transition-colors md:py-5 ${
                    i === active
                      ? "border-l-tractor-red text-ink"
                      : "border-l-transparent text-ink/45 hover:border-l-tractor-red/50 hover:text-ink"
                  }`}
                >
                  <span className="font-display text-sm tabular-nums text-tractor-red md:text-base">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-display text-xl font-semibold tracking-tight md:text-2xl">
                      {service.title}
                    </span>
                    {i === active && (
                      <span className="mt-2 block max-w-[52ch] text-base leading-relaxed text-ink/60">
                        {service.body}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative hidden aspect-[4/5] overflow-hidden bg-[#ece8de] lg:col-span-5 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={image}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : DURATION.medium, ease: EASE }}
              >
                <Image src={image} alt="" fill sizes="40vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
