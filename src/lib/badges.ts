export const BADGE_TONES = ["red", "black", "gold", "gray"] as const;
export type BadgeTone = (typeof BADGE_TONES)[number];

export function resolveBadgeTone(value: string | null | undefined): BadgeTone {
  return BADGE_TONES.includes(value as BadgeTone) ? (value as BadgeTone) : "red";
}

export function toneClass(tone: BadgeTone) {
  if (tone === "black") return "bg-ink text-warm";
  if (tone === "gold") return "bg-[#c6a15b] text-ink";
  if (tone === "gray") return "bg-[#5c5a55] text-warm";
  return "bg-tractor-red text-white";
}

export const TONE_LABELS: Record<BadgeTone, string> = {
  red: "Kırmızı",
  black: "Siyah",
  gold: "Altın",
  gray: "Gri",
};
