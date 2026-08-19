"use client";

import { useT } from "@/components/i18n/LocaleProvider";
import { resolveBadgeTone, toneClass } from "@/lib/badges";

export default function ProductBadges({
  isNew,
  isCampaign,
  customBadge,
  customBadgeTone,
  placement = "overlay",
}: {
  isNew: boolean;
  isCampaign: boolean;
  customBadge?: string | null;
  customBadgeTone?: string | null;
  placement?: "overlay" | "inline";
}) {
  const t = useT();
  const custom = customBadge?.trim() || "";
  if (!isNew && !isCampaign && !custom) return null;

  const pill = "px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase";
  const badges = (
    <>
      {isNew ? <span className={`${pill} bg-ink text-warm`}>{t.productList.newBadge}</span> : null}
      {isCampaign ? <span className={`${pill} bg-tractor-red text-white`}>{t.productList.campaignBadge}</span> : null}
      {custom ? <span className={`${pill} ${toneClass(resolveBadgeTone(customBadgeTone))}`}>{custom}</span> : null}
    </>
  );

  if (placement === "inline") {
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  }

  return <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">{badges}</div>;
}
