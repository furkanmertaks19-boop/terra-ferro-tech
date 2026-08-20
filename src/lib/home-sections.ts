import { prisma, withPrismaRetry } from "@/lib/prisma";
import {
  isHomeSectionType,
  parseHomeConfig,
  type HomeSectionConfig,
  type HomeSectionFeature,
  type HomeSectionRecord,
  type HomeSectionType,
} from "@/lib/home-section-types";
import { ABOUT } from "@/lib/site-content";
import { getRequestLocale } from "@/lib/i18n/request";
import { parseI18nBag } from "@/lib/i18n/config";
import { pickPublicText } from "@/lib/i18n/content";
import { localizeHref } from "@/lib/i18n/routing";
import { aboutFeatureDefault, homeSectionFieldDefault } from "@/lib/i18n/page-defaults";

const FALLBACK: HomeSectionRecord[] = [
  {
    id: "home_hero_slider",
    type: "hero-slider",
    variant: "default",
    title: "Hero Slider",
    eyebrow: "",
    body: "",
    image: null,
    mobileImage: null,
    ctaLabel: "",
    ctaHref: "",
    config: {},
    sortOrder: 0,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_model_finder",
    type: "model-finder",
    variant: "default",
    title: "Gjej modelin",
    eyebrow: "Gjej modelin",
    body: "",
    image: null,
    mobileImage: null,
    ctaLabel: "Shiko Traktorët",
    ctaHref: "/traktoret",
    config: {},
    sortOrder: 1,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_featured_tractors",
    type: "featured-tractors",
    variant: "default",
    title: "Modelet e zgjedhura të traktorëve",
    eyebrow: "Traktorët",
    body: "Zgjidhni nga modelet më të përshtatshme për pemishte, fusha dhe përdorim të përditshëm.",
    image: null,
    mobileImage: null,
    ctaLabel: "Shiko të gjithë traktorët",
    ctaHref: "/traktoret",
    config: { source: "featured", take: 3 },
    sortOrder: 2,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_equipment",
    type: "product-categories",
    variant: "default",
    title: "Makineri për tokën.",
    eyebrow: "Makineri Bujqësore",
    body: "Kultivatorë, rotovatorë, plugje dhe pajisje nga katalogu.",
    image: null,
    mobileImage: null,
    ctaLabel: "Shiko Makineritë",
    ctaHref: "/makineri-bujqesore",
    config: { categoryLimit: 8 },
    sortOrder: 3,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_services",
    type: "services-list",
    variant: "default",
    title: "Nga zgjedhja te servisi.",
    eyebrow: "Shërbimet",
    body: "",
    image: null,
    mobileImage: null,
    ctaLabel: "",
    ctaHref: "/sherbimet",
    config: {},
    sortOrder: 4,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_about",
    type: "about-split",
    variant: "image-left",
    title: ABOUT.headline,
    eyebrow: "Terra Ferro Tech",
    body: ABOUT.body,
    image: "/images/home/brand-story.jpg",
    mobileImage: null,
    ctaLabel: "Rreth Nesh",
    ctaHref: "/rreth-nesh",
    config: { features: ABOUT.values.map((item) => ({ title: item.title, body: item.body })) },
    sortOrder: 5,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
  {
    id: "home_cta",
    type: "cta-banner",
    variant: "red",
    title: "Kërkoni makinën e duhur?",
    eyebrow: "",
    body: "Flisni me ekipin tonë.",
    image: null,
    mobileImage: null,
    ctaLabel: "Kërko Ofertë",
    ctaHref: "/kontakt",
    config: {},
    sortOrder: 6,
    isVisible: true,
    updatedAt: new Date(0).toISOString(),
  },
];

function mapSection(row: {
  id: string;
  type: string;
  variant: string;
  title: string;
  eyebrow: string;
  body: string;
  image: string | null;
  mobileImage: string | null;
  ctaLabel: string;
  ctaHref: string;
  config: unknown;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: Date;
  i18n?: unknown;
}, locale: "sq" | "en" | "tr", forAdmin = false): HomeSectionRecord | null {
  if (!isHomeSectionType(row.type)) return null;
  const copy = locale === "sq" || forAdmin ? {} : parseI18nBag(row.i18n)[locale] ?? {};
  const configOverlay =
    copy.config && typeof copy.config === "object" ? (copy.config as { features?: unknown }) : {};
  return {
    id: row.id,
    type: row.type,
    variant: row.variant,
    title: forAdmin
      ? row.title
      : pickPublicText(locale, copy.title, row.title, homeSectionFieldDefault(row.type, "title", locale)),
    eyebrow: forAdmin
      ? row.eyebrow
      : pickPublicText(locale, copy.eyebrow, row.eyebrow, homeSectionFieldDefault(row.type, "eyebrow", locale)),
    body: forAdmin
      ? row.body
      : pickPublicText(locale, copy.body, row.body, homeSectionFieldDefault(row.type, "body", locale)),
    image: row.image,
    mobileImage: row.mobileImage,
    ctaLabel: forAdmin
      ? row.ctaLabel
      : pickPublicText(locale, copy.ctaLabel, row.ctaLabel, homeSectionFieldDefault(row.type, "ctaLabel", locale)),
    ctaHref: forAdmin ? row.ctaHref : localizeHref(row.ctaHref || "/", locale),
    config: localizeHomeConfig(parseHomeConfig(row.config), locale, configOverlay.features, forAdmin),
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
    i18n: row.i18n,
  };
}

function localizeHomeConfig(
  config: HomeSectionConfig,
  locale: "sq" | "en" | "tr",
  overlayFeatures: unknown,
  forAdmin: boolean,
): HomeSectionConfig {
  if (forAdmin || !Array.isArray(config.features)) return config;
  const overlay = Array.isArray(overlayFeatures) ? overlayFeatures : [];
  const features: HomeSectionFeature[] = config.features.map((item, index) => {
    const row = overlay[index] && typeof overlay[index] === "object" ? (overlay[index] as Record<string, unknown>) : {};
    const dict = aboutFeatureDefault(locale, index);
    return {
      title: pickPublicText(locale, row.title, item.title, dict.title),
      body: pickPublicText(locale, row.body, item.body, dict.body),
    };
  });
  return { ...config, features };
}

export async function getHomeSections(includeHidden = false): Promise<HomeSectionRecord[]> {
  const locale = includeHidden ? "sq" : await getRequestLocale();
  try {
    const rows = await withPrismaRetry(() =>
      prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
    );
    const mapped = rows
      .map((row) => mapSection(row, locale, includeHidden))
      .filter((row): row is HomeSectionRecord => Boolean(row));
    if (!mapped.length) {
      const fallback = includeHidden ? FALLBACK : FALLBACK.filter((row) => row.isVisible);
      return fallback.map((row) => ({
        ...row,
        title: pickPublicText(locale, undefined, row.title, homeSectionFieldDefault(row.type, "title", locale)),
        eyebrow: pickPublicText(locale, undefined, row.eyebrow, homeSectionFieldDefault(row.type, "eyebrow", locale)),
        body: pickPublicText(locale, undefined, row.body, homeSectionFieldDefault(row.type, "body", locale)),
        ctaLabel: pickPublicText(locale, undefined, row.ctaLabel, homeSectionFieldDefault(row.type, "ctaLabel", locale)),
        ctaHref: includeHidden ? row.ctaHref : localizeHref(row.ctaHref || "/", locale),
        config: localizeHomeConfig(row.config, locale, undefined, includeHidden),
      }));
    }
    return includeHidden ? mapped : mapped.filter((row) => row.isVisible);
  } catch {
    return includeHidden ? FALLBACK : FALLBACK.filter((row) => row.isVisible).map((row) => ({
      ...row,
      title: pickPublicText(locale, undefined, row.title, homeSectionFieldDefault(row.type, "title", locale)),
      eyebrow: pickPublicText(locale, undefined, row.eyebrow, homeSectionFieldDefault(row.type, "eyebrow", locale)),
      body: pickPublicText(locale, undefined, row.body, homeSectionFieldDefault(row.type, "body", locale)),
      ctaLabel: pickPublicText(locale, undefined, row.ctaLabel, homeSectionFieldDefault(row.type, "ctaLabel", locale)),
      ctaHref: localizeHref(row.ctaHref || "/", locale),
      config: localizeHomeConfig(row.config, locale, undefined, false),
    }));
  }
}

export function defaultSectionValues(type: HomeSectionType, variant = "default"): Omit<HomeSectionRecord, "id" | "sortOrder" | "updatedAt" | "isVisible"> {
  if (type === "gallery-preview") {
    return {
      type,
      variant,
      title: "Momente nga Terra Ferro Tech",
      eyebrow: "Galeria",
      body: "Foto dhe video nga makineritë, dorëzimet dhe puna në terren.",
      image: null,
      mobileImage: null,
      ctaLabel: "Shiko Galerinë",
      ctaHref: "/galeri",
      config: { source: "latest", take: 6 },
    };
  }
  const found = FALLBACK.find((row) => row.type === type);
  return {
    type,
    variant,
    title: found?.title ?? "",
    eyebrow: found?.eyebrow ?? "",
    body: found?.body ?? "",
    image: found?.image ?? null,
    mobileImage: null,
    ctaLabel: found?.ctaLabel ?? "",
    ctaHref: found?.ctaHref ?? "",
    config: found?.config ?? {},
  };
}
