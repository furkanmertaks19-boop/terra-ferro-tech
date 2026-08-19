export const SLIDE_POSITIONS = [
  { id: "left-center", label: "Sol Orta" },
  { id: "left-bottom", label: "Sol Alt" },
  { id: "center", label: "Orta" },
  { id: "right-center", label: "Sağ Orta" },
] as const;

export type SlidePosition = (typeof SLIDE_POSITIONS)[number]["id"];

export type PublicHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string | null;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  contentPosition: SlidePosition;
  overlayOpacity: number;
  autoplayDuration: number;
};

export function isSlidePosition(value: string): value is SlidePosition {
  return SLIDE_POSITIONS.some((item) => item.id === value);
}

export function isQuoteAction(url: string) {
  const v = url.trim().toLowerCase();
  return v === "#quote" || v === "quote";
}

export type AdminSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string | null;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  contentPosition: string;
  overlayOpacity: number;
  isActive: boolean;
  sortOrder: number;
  autoplayDuration: number;
  createdAt: string;
  updatedAt: string;
  startsAt: string | null;
  endsAt: string | null;
  i18n?: unknown;
};
