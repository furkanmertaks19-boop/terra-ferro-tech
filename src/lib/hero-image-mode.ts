export const HERO_IMAGE_MODES = ["AUTO", "COVER", "CONTAIN"] as const;
export type HeroImageMode = (typeof HERO_IMAGE_MODES)[number];

export function isHeroImageMode(value: string | null | undefined): value is HeroImageMode {
  return value === "AUTO" || value === "COVER" || value === "CONTAIN";
}

export function resolveHeroImageMode(value: string | null | undefined): HeroImageMode {
  return isHeroImageMode(value) ? value : "AUTO";
}

/** Cinematic treats AUTO as contain so catalog studio shots are not cropped. */
export function cinematicHeroFit(value: string | null | undefined): "cover" | "contain" {
  return resolveHeroImageMode(value) === "COVER" ? "cover" : "contain";
}

export function editorCinematicImageMode(value: string | null | undefined): "COVER" | "CONTAIN" {
  return resolveHeroImageMode(value) === "COVER" ? "COVER" : "CONTAIN";
}
