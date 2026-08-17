import { prisma, withPrismaRetry } from "@/lib/prisma";
import {
  isHomeSectionType,
  parseHomeConfig,
  type HomeSectionRecord,
  type HomeSectionType,
} from "@/lib/home-section-types";
import { ABOUT } from "@/lib/site-content";

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
}): HomeSectionRecord | null {
  if (!isHomeSectionType(row.type)) return null;
  return {
    id: row.id,
    type: row.type,
    variant: row.variant,
    title: row.title,
    eyebrow: row.eyebrow,
    body: row.body,
    image: row.image,
    mobileImage: row.mobileImage,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    config: parseHomeConfig(row.config),
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getHomeSections(includeHidden = false): Promise<HomeSectionRecord[]> {
  try {
    const rows = await withPrismaRetry(() =>
      prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } })
    );
    const mapped = rows.map(mapSection).filter((row): row is HomeSectionRecord => Boolean(row));
    if (!mapped.length) return includeHidden ? FALLBACK : FALLBACK.filter((row) => row.isVisible);
    return includeHidden ? mapped : mapped.filter((row) => row.isVisible);
  } catch {
    return includeHidden ? FALLBACK : FALLBACK.filter((row) => row.isVisible);
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
