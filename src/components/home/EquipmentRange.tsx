"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { RangeItem } from "@/lib/products";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import { SectionIndex } from "@/components/ui/SectionIndex";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

export default function EquipmentRange({
  items,
  section,
}: {
  items: RangeItem[];
  section?: HomeSectionRecord;
}) {
  if (!items.length) return null;
  const title = section?.title || "Makineri për tokën.";
  const body = section?.body || "Kultivatorë, rotovatorë, plugje dhe pajisje nga katalogu.";
  const ctaLabel = section?.ctaLabel || "Shiko Makineritë";
  const ctaHref = section?.ctaHref || "/makineri-bujqesore";
  const eyebrow = section?.eyebrow || "Makineri Bujqësore";

  return (
    <section className="bg-ivory py-20 text-ink md:py-[96px]">
      <div className="container-site">
        <SectionIndex index="04" label={eyebrow} tone="light" />
        <div className="mt-6 grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5" y={20}>
            <h2 className="font-display text-[clamp(40px,4vw,66px)] font-semibold leading-[0.95] tracking-tight">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink/65">{body}</p>
            <div className="mt-8">
              <Button href={ctaHref} variant="dark" arrow>
                {ctaLabel}
              </Button>
            </div>
          </Reveal>

          <Stagger className="lg:col-span-7">
            {items.map((item, i) => (
              <StaggerItem key={item.key}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between gap-4 border-b border-ink/10 py-3.5 pl-0 text-ink transition-colors hover:text-tractor-red md:py-4"
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span className="font-display text-sm tabular-nums text-tractor-red md:text-base">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">{item.label}</span>
                  </span>
                  <span className="flex items-center gap-3 text-[13px] text-ink/45 md:text-[14px]">
                    {item.count}
                    <ArrowUpRight size={16} className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:text-tractor-red" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
