import { ABOUT, SERVICES } from "@/lib/site-content";
import { uid } from "@/lib/admin-content";

export const PAGE_KEYS = ["about", "tractors", "equipment", "gallery", "services", "contact"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export type PageEditorKind = "hero" | "about" | "gallery" | "services" | "contact";
export type HeroType = "image" | "slider";
export type TextPosition = "left" | "left-bottom" | "center";
export type HeroHeight = "compact" | "standard" | "tall";

export type PageHeroSlide = {
  id: string;
  image: string;
  mobileImage: string | null;
  sortOrder: number;
  isActive: boolean;
  title?: string;
};

export type PageFeatureItem = {
  id: string;
  title: string;
  body: string;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type AboutConfig = {
  introTitle: string;
  introBody: string;
  introImage: string | null;
  features: PageFeatureItem[];
  ctaTitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export type ServicesConfig = {
  items: PageFeatureItem[];
  ctaLabel: string;
  ctaHref: string;
};

export type GalleryConfig = {
  showFilters: boolean;
};

export type ContactConfig = {
  formTitle: string;
  submitLabel: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
};

export type PageConfig = AboutConfig | ServicesConfig | GalleryConfig | ContactConfig | Record<string, never>;

export type PageRevision = {
  eyebrow: string;
  title: string;
  description: string;
  heroType: HeroType;
  heroImage: string;
  mobileImage: string | null;
  overlayOpacity: number;
  textPosition: TextPosition;
  heroHeight: HeroHeight;
  slides: PageHeroSlide[];
  config: PageConfig;
};

export type PublicPageHero = {
  eyebrow: string;
  title: string;
  description: string;
  heroType: HeroType;
  heroImage: string | null;
  mobileImage: string | null;
  slides: PageHeroSlide[];
  overlayOpacity: number;
  textPosition: TextPosition;
  heroHeight: HeroHeight;
};

export type PublicPageContent = PublicPageHero & {
  pageKey: PageKey;
  config: PageConfig;
};

export const PAGE_DEFS: {
  key: PageKey;
  adminTitle: string;
  publicName: string;
  path: string;
  kind: PageEditorKind;
  summary: string;
}[] = [
  { key: "about", adminTitle: "Hakkımızda", publicName: "Rreth Nesh", path: "/rreth-nesh", kind: "about", summary: "Tam içerik yönetimi" },
  { key: "tractors", adminTitle: "Traktörler", publicName: "Traktorët", path: "/traktoret", kind: "hero", summary: "Sadece hero" },
  { key: "equipment", adminTitle: "Tarım Makineleri", publicName: "Makineri Bujqësore", path: "/makineri-bujqesore", kind: "hero", summary: "Sadece hero" },
  { key: "gallery", adminTitle: "Galeri", publicName: "Galeria", path: "/galeri", kind: "gallery", summary: "Hero + sayfa metinleri" },
  { key: "services", adminTitle: "Hizmetler", publicName: "Shërbimet", path: "/sherbimet", kind: "services", summary: "Tam içerik yönetimi" },
  { key: "contact", adminTitle: "Kontakt", publicName: "Kontakt", path: "/kontakt", kind: "contact", summary: "Sayfa + form metinleri" },
];

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value);
}

export function pageDef(key: PageKey) {
  return PAGE_DEFS.find((item) => item.key === key)!;
}

export function isHeroType(value: string): value is HeroType {
  return value === "image" || value === "slider";
}

export function isTextPosition(value: string): value is TextPosition {
  return value === "left" || value === "left-bottom" || value === "center";
}

export function isHeroHeight(value: string): value is HeroHeight {
  return value === "compact" || value === "standard" || value === "tall";
}

export const HERO_HEIGHT_PX: Record<HeroHeight, number> = {
  compact: 420,
  standard: 560,
  tall: 680,
};

export function defaultAboutConfig(): AboutConfig {
  return {
    introTitle: "Çfarë ofrojmë",
    introBody: ABOUT.body,
    introImage: null,
    features: ABOUT.values.map((item, index) => ({
      id: uid(),
      title: item.title,
      body: item.body,
      sortOrder: index,
      isActive: true,
    })),
    ctaTitle: "Kontakt",
    ctaLabel: "Na Kontaktoni",
    ctaHref: "/kontakt",
  };
}

export function defaultServicesConfig(): ServicesConfig {
  return {
    items: SERVICES.map((item, index) => ({
      id: uid(),
      title: item.title,
      body: item.body,
      image: null,
      sortOrder: index,
      isActive: true,
    })),
    ctaLabel: "Na Kontaktoni",
    ctaHref: "/kontakt",
  };
}

export function defaultGalleryConfig(): GalleryConfig {
  return { showFilters: true };
}

export function defaultContactConfig(): ContactConfig {
  return {
    formTitle: "Dërgoni një mesazh",
    submitLabel: "Dërgo",
    nameLabel: "Emri dhe mbiemri",
    phoneLabel: "Telefoni",
    emailLabel: "Email",
    subjectLabel: "Subjekti",
    messageLabel: "Mesazhi",
  };
}

export function defaultRevision(key: PageKey): PageRevision {
  if (key === "about") {
    return {
      eyebrow: "Terra Ferro Tech",
      title: ABOUT.headline,
      description: ABOUT.body,
      heroType: "image",
      heroImage: "/images/home/brand-story.jpg",
      mobileImage: null,
      overlayOpacity: 55,
      textPosition: "left-bottom",
      heroHeight: "tall",
      slides: [],
      config: defaultAboutConfig(),
    };
  }
  if (key === "tractors") {
    return {
      eyebrow: "GAMA E PRODUKTEVE",
      title: "Traktorët",
      description: "Fuqi, efikasitet dhe teknologji për çdo lloj pune bujqësore.",
      heroType: "image",
      heroImage: "/images/home/category-tractors.jpg",
      mobileImage: null,
      overlayOpacity: 45,
      textPosition: "left",
      heroHeight: "standard",
      slides: [],
      config: {},
    };
  }
  if (key === "equipment") {
    return {
      eyebrow: "GAMA E PRODUKTEVE",
      title: "Makineri Bujqësore",
      description: "Pajisje moderne për punimin e tokës, plehrimin dhe mbrojtjen e kulturave.",
      heroType: "image",
      heroImage: "/images/home/category-equipment.jpg",
      mobileImage: null,
      overlayOpacity: 45,
      textPosition: "left",
      heroHeight: "standard",
      slides: [],
      config: {},
    };
  }
  if (key === "gallery") {
    return {
      eyebrow: "Galeria",
      title: "Foto dhe Video",
      description: "Momente nga Terra Ferro Tech — traktorët, makineritë dhe puna në terren.",
      heroType: "image",
      heroImage: "",
      mobileImage: null,
      overlayOpacity: 45,
      textPosition: "left",
      heroHeight: "compact",
      slides: [],
      config: defaultGalleryConfig(),
    };
  }
  if (key === "services") {
    return {
      eyebrow: "Terra Ferro Tech",
      title: "Shërbimet",
      description: "Nga zgjedhja e modelit deri te pjesët e këmbimit, ju qëndrojmë pranë pas shitjes.",
      heroType: "image",
      heroImage: "",
      mobileImage: null,
      overlayOpacity: 45,
      textPosition: "left",
      heroHeight: "compact",
      slides: [],
      config: defaultServicesConfig(),
    };
  }
  return {
    eyebrow: "Terra Ferro Tech",
    title: "Kontakt",
    description: "Na shkruani ose na telefononi. Ekipi ynë ju kthen përgjigje sa më shpejt.",
    heroType: "image",
    heroImage: "",
    mobileImage: null,
    overlayOpacity: 45,
    textPosition: "left",
    heroHeight: "compact",
    slides: [],
    config: defaultContactConfig(),
  };
}

export function parseSlides(value: unknown): PageHeroSlide[] {
  if (!Array.isArray(value)) return [];
  const slides: PageHeroSlide[] = [];
  value.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const image = typeof row.image === "string" ? row.image : "";
    if (!image) return;
    slides.push({
      id: typeof row.id === "string" && row.id ? row.id : uid(),
      image,
      mobileImage: typeof row.mobileImage === "string" && row.mobileImage ? row.mobileImage : null,
      sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : index,
      isActive: row.isActive !== false,
      ...(typeof row.title === "string" ? { title: row.title } : {}),
    });
  });
  return slides.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseFeatures(value: unknown): PageFeatureItem[] {
  if (!Array.isArray(value)) return [];
  const features: PageFeatureItem[] = [];
  value.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return;
    features.push({
      id: typeof row.id === "string" && row.id ? row.id : uid(),
      title,
      body: typeof row.body === "string" ? row.body : "",
      image: typeof row.image === "string" && row.image ? row.image : null,
      sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : index,
      isActive: row.isActive !== false,
    });
  });
  return features.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function parseAboutConfig(value: unknown): AboutConfig {
  const fallback = defaultAboutConfig();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  const features = parseFeatures(raw.features);
  return {
    introTitle: typeof raw.introTitle === "string" && raw.introTitle ? raw.introTitle : fallback.introTitle,
    introBody: typeof raw.introBody === "string" ? raw.introBody : fallback.introBody,
    introImage: typeof raw.introImage === "string" && raw.introImage ? raw.introImage : null,
    features: features.length ? features : fallback.features,
    ctaTitle: typeof raw.ctaTitle === "string" && raw.ctaTitle ? raw.ctaTitle : fallback.ctaTitle,
    ctaLabel: typeof raw.ctaLabel === "string" && raw.ctaLabel ? raw.ctaLabel : fallback.ctaLabel,
    ctaHref: typeof raw.ctaHref === "string" && raw.ctaHref ? raw.ctaHref : fallback.ctaHref,
  };
}

export function parseServicesConfig(value: unknown): ServicesConfig {
  const fallback = defaultServicesConfig();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  const items = parseFeatures(raw.items);
  return {
    items: items.length ? items : fallback.items,
    ctaLabel: typeof raw.ctaLabel === "string" && raw.ctaLabel ? raw.ctaLabel : fallback.ctaLabel,
    ctaHref: typeof raw.ctaHref === "string" && raw.ctaHref ? raw.ctaHref : fallback.ctaHref,
  };
}

export function parseGalleryConfig(value: unknown): GalleryConfig {
  if (!value || typeof value !== "object") return defaultGalleryConfig();
  const raw = value as Record<string, unknown>;
  return { showFilters: raw.showFilters !== false };
}

export function parseContactConfig(value: unknown): ContactConfig {
  const fallback = defaultContactConfig();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  return {
    formTitle: typeof raw.formTitle === "string" && raw.formTitle ? raw.formTitle : fallback.formTitle,
    submitLabel: typeof raw.submitLabel === "string" && raw.submitLabel ? raw.submitLabel : fallback.submitLabel,
    nameLabel: typeof raw.nameLabel === "string" && raw.nameLabel ? raw.nameLabel : fallback.nameLabel,
    phoneLabel: typeof raw.phoneLabel === "string" && raw.phoneLabel ? raw.phoneLabel : fallback.phoneLabel,
    emailLabel: typeof raw.emailLabel === "string" && raw.emailLabel ? raw.emailLabel : fallback.emailLabel,
    subjectLabel: typeof raw.subjectLabel === "string" && raw.subjectLabel ? raw.subjectLabel : fallback.subjectLabel,
    messageLabel: typeof raw.messageLabel === "string" && raw.messageLabel ? raw.messageLabel : fallback.messageLabel,
  };
}

export function parseConfig(key: PageKey, value: unknown): PageConfig {
  if (key === "about") return parseAboutConfig(value);
  if (key === "services") return parseServicesConfig(value);
  if (key === "gallery") return parseGalleryConfig(value);
  if (key === "contact") return parseContactConfig(value);
  return {};
}

export function parseRevision(key: PageKey, value: unknown): PageRevision {
  const fallback = defaultRevision(key);
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  return {
    eyebrow: typeof raw.eyebrow === "string" ? raw.eyebrow : fallback.eyebrow,
    title: typeof raw.title === "string" && raw.title.trim() ? raw.title : fallback.title,
    description: typeof raw.description === "string" ? raw.description : fallback.description,
    heroType: typeof raw.heroType === "string" && isHeroType(raw.heroType) ? raw.heroType : fallback.heroType,
    heroImage: typeof raw.heroImage === "string" ? raw.heroImage : fallback.heroImage,
    mobileImage: typeof raw.mobileImage === "string" && raw.mobileImage ? raw.mobileImage : null,
    overlayOpacity: typeof raw.overlayOpacity === "number" ? Math.min(80, Math.max(0, raw.overlayOpacity)) : fallback.overlayOpacity,
    textPosition: typeof raw.textPosition === "string" && isTextPosition(raw.textPosition) ? raw.textPosition : fallback.textPosition,
    heroHeight: typeof raw.heroHeight === "string" && isHeroHeight(raw.heroHeight) ? raw.heroHeight : fallback.heroHeight,
    slides: parseSlides(raw.slides),
    config: parseConfig(key, raw.config),
  };
}

export function revisionToHero(revision: PageRevision): PublicPageHero {
  const slides = revision.slides.filter((item) => item.isActive && item.image).sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    eyebrow: revision.eyebrow,
    title: revision.title,
    description: revision.description,
    heroType: revision.heroType === "slider" && slides.length > 0 ? "slider" : "image",
    heroImage: revision.heroImage.trim() || null,
    mobileImage: revision.mobileImage,
    slides,
    overlayOpacity: revision.overlayOpacity,
    textPosition: revision.textPosition,
    heroHeight: revision.heroHeight,
  };
}

export function toPublicPage(key: PageKey, revision: PageRevision): PublicPageContent {
  return { pageKey: key, ...revisionToHero(revision), config: revision.config };
}

export function publicPathFor(key: PageKey) {
  return pageDef(key).path;
}
