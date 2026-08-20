"use client";

import LocaleLink from "@/components/i18n/LocaleLink";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import { UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import QuoteButton from "@/components/product/QuoteButton";
import {
  usedTractorCover,
  usedTractorHref,
  usedTractorLabel,
} from "@/lib/used-tractor-path";
import type { PublicUsedTractor } from "@/lib/used-tractors";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";

function statusBadge(status: UsedTractorStatus, t: ReturnType<typeof useT>) {
  if (status === UsedTractorStatus.SOLD) return { label: t.used.sold, className: "bg-ink text-white" };
  if (status === UsedTractorStatus.RESERVED) return { label: t.used.reserved, className: "bg-tractor-red text-white" };
  return null;
}

function driveLabel(drive: UsedTractorDrive | null) {
  if (drive === UsedTractorDrive.FOUR_WD) return "4x4";
  if (drive === UsedTractorDrive.TWO_WD) return "4x2";
  return null;
}

export default function UsedTractorCard({ item }: { item: PublicUsedTractor }) {
  const t = useT();
  const locale = useLocale();
  const cover = usedTractorCover(item);
  const badge = statusBadge(item.status, t);
  const facts = [
    item.year ? `${t.usedPage.year} ${item.year}` : null,
    item.hours != null ? `${item.hours.toLocaleString("sq-AL")} ${t.usedPage.hours.toLowerCase()}` : null,
    item.horsePower != null ? `${item.horsePower} HP` : null,
  ].filter(Boolean);
  const extras = [driveLabel(item.drive), item.hasCabin ? t.productDetail.cabin : t.productDetail.rops, item.fuelType].filter(Boolean).slice(0, 3);
  const label = usedTractorLabel(item);
  const sold = item.status === UsedTractorStatus.SOLD;

  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-warm-white">
      <LocaleLink href={usedTractorHref(item.slug, locale)} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d8]">
          {badge ? (
            <span className={`absolute left-3 top-3 z-[2] px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${badge.className}`}>
              {badge.label}
            </span>
          ) : null}
          {cover ? (
            <Image
              src={cover}
              alt={`${label} i përdorur`}
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 100vw"
              className={`object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] ${sold ? "grayscale-[0.35]" : ""}`}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-[13px] tracking-[0.16em] uppercase text-ink/35">Terra Ferro Tech</p>
              <p className="text-sm text-ink/40">{t.productDetail.noImage}</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 py-5">
          <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-tractor-red">{item.brand}</p>
          <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">{item.model}</h3>
          <p className="mt-2 text-sm text-ink/55">{facts.join(" · ")}</p>
          {extras.length ? <p className="mt-1 text-sm text-ink/45">{extras.join(" · ")}</p> : null}
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[12px] font-semibold tracking-[0.12em] uppercase">
            {t.productList.viewDetails}
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </LocaleLink>
      {!sold ? (
        <div className="border-t border-ink/10 px-5 py-3">
          <QuoteButton usedTractorId={item.id} productLabel={label} className="w-full" />
        </div>
      ) : null}
    </article>
  );
}
