export const HOME_SECTION_TYPES = [
  "hero-slider",
  "hero-single",
  "model-finder",
  "featured-tractors",
  "featured-equipment",
  "product-categories",
  "image-text",
  "about-split",
  "services-list",
  "technical-highlight",
  "cta-banner",
  "contact-preview",
  "gallery-preview",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export type HomeSectionFeature = { title: string; body: string };

export type HomeSectionConfig = {
  productIds?: string[];
  take?: number;
  source?: "manual" | "featured" | "latest";
  features?: HomeSectionFeature[];
  categoryLimit?: number;
  galleryItemIds?: string[];
};

export type HomeSectionRecord = {
  id: string;
  type: HomeSectionType;
  variant: string;
  title: string;
  eyebrow: string;
  body: string;
  image: string | null;
  mobileImage: string | null;
  ctaLabel: string;
  ctaHref: string;
  config: HomeSectionConfig;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: string;
  i18n?: unknown;
};

export type HomeSectionTemplate = {
  type: HomeSectionType;
  variant: string;
  name: string;
  description: string;
  preview: "slider" | "hero" | "cards" | "split" | "list" | "banner" | "finder" | "gallery";
};

export const HOME_SECTION_TEMPLATES: HomeSectionTemplate[] = [
  { type: "hero-slider", variant: "default", name: "Hero Slider", description: "Mevcut slider sistemindeki aktif slaytlar", preview: "slider" },
  { type: "hero-single", variant: "left", name: "Hero Single", description: "Tek büyük görsel, başlık solda", preview: "hero" },
  { type: "hero-single", variant: "center", name: "Hero Single — Merkez", description: "Tek görsel, metin ortada", preview: "hero" },
  { type: "model-finder", variant: "default", name: "Model Finder", description: "Traktör arama ve filtre kutusu", preview: "finder" },
  { type: "featured-tractors", variant: "default", name: "Öne Çıkan Traktörler", description: "3–4 seçilmiş traktör kartı", preview: "cards" },
  { type: "featured-equipment", variant: "default", name: "Öne Çıkan Makineler", description: "3–4 tarım makinesi kartı", preview: "cards" },
  { type: "product-categories", variant: "default", name: "Tarım Makineleri", description: "Kategori listesi ve kısa tanıtım", preview: "list" },
  { type: "image-text", variant: "image-left", name: "Görsel + Metin", description: "Görsel solda, metin sağda", preview: "split" },
  { type: "image-text", variant: "image-right", name: "Görsel + Metin — Sağ", description: "Görsel sağda, metin solda", preview: "split" },
  { type: "image-text", variant: "full-width", name: "Tam Genişlik Görsel", description: "Görsel tam genişlik, metin üzerinde", preview: "hero" },
  { type: "image-text", variant: "editorial", name: "Editorial Split", description: "Dar metin sütunu, büyük görsel", preview: "split" },
  { type: "about-split", variant: "image-left", name: "Terra Ferro Tech", description: "Firma tanıtımı, görsel solda", preview: "split" },
  { type: "about-split", variant: "image-right", name: "Terra Ferro Tech — Ters", description: "Firma tanıtımı, görsel sağda", preview: "split" },
  { type: "services-list", variant: "default", name: "Hizmetler", description: "Hizmet listesi ve görsel", preview: "list" },
  { type: "technical-highlight", variant: "default", name: "Teknik Spotlight", description: "Tek ürün / teknik vurgu", preview: "split" },
  { type: "cta-banner", variant: "red", name: "Teklif CTA", description: "Kırmızı teklif bandı", preview: "banner" },
  { type: "cta-banner", variant: "dark", name: "Teklif CTA — Koyu", description: "Koyu zemin teklif bandı", preview: "banner" },
  { type: "contact-preview", variant: "default", name: "İletişim Önizleme", description: "Telefon, e-posta ve konum", preview: "banner" },
  { type: "gallery-preview", variant: "default", name: "Gallery Preview", description: "Son yayınlanan fotoğraf ve videolar", preview: "gallery" },
];

export function isHomeSectionType(value: string): value is HomeSectionType {
  return (HOME_SECTION_TYPES as readonly string[]).includes(value);
}

export function parseHomeConfig(value: unknown): HomeSectionConfig {
  if (!value || typeof value !== "object") return {};
  const raw = value as HomeSectionConfig;
  return {
    productIds: Array.isArray(raw.productIds) ? raw.productIds.filter((id) => typeof id === "string") : undefined,
    take: typeof raw.take === "number" ? raw.take : undefined,
    source: raw.source === "manual" || raw.source === "featured" || raw.source === "latest" ? raw.source : undefined,
    features: Array.isArray(raw.features)
      ? raw.features.filter((item) => item && typeof item.title === "string" && typeof item.body === "string")
      : undefined,
    categoryLimit: typeof raw.categoryLimit === "number" ? raw.categoryLimit : undefined,
    galleryItemIds: Array.isArray(raw.galleryItemIds) ? raw.galleryItemIds.filter((id) => typeof id === "string") : undefined,
  };
}
