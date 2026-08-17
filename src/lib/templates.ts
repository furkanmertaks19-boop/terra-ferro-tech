import { Category } from "@prisma/client";

export const PRODUCT_TEMPLATE_IDS = [
  "tractor-cinematic",
  "tractor-technical",
  "equipment-showcase",
  "equipment-technical",
] as const;

export type ProductTemplateId = (typeof PRODUCT_TEMPLATE_IDS)[number];

export type TemplateMeta = {
  id: ProductTemplateId;
  name: string;
  description: string;
  preview: "cinematic" | "technical" | "showcase" | "blueprint";
  categories: Category[];
};

export const TEMPLATE_CATALOG: TemplateMeta[] = [
  {
    id: "tractor-cinematic",
    name: "Tractor Cinematic",
    description: "Tam ekran slider, overlay başlık ve aşağı devam eden ürün hikâyesi",
    preview: "cinematic",
    categories: [Category.TRACTOR],
  },
  {
    id: "tractor-technical",
    name: "Tractor Technical",
    description: "Teknik paneller ve spesifikasyon ağırlıklı",
    preview: "technical",
    categories: [Category.TRACTOR],
  },
  {
    id: "equipment-showcase",
    name: "Equipment Showcase",
    description: "Makine merkezde, ölçü ve HP yanında",
    preview: "showcase",
    categories: [Category.EQUIPMENT],
  },
  {
    id: "equipment-technical",
    name: "Equipment Technical",
    description: "Boyut, kapasite ve uyumluluk kartları",
    preview: "blueprint",
    categories: [Category.EQUIPMENT],
  },
];

export function defaultTemplateFor(category: Category): ProductTemplateId {
  return category === Category.TRACTOR ? "tractor-cinematic" : "equipment-showcase";
}

export const DEFAULT_TEMPLATE: ProductTemplateId = "tractor-cinematic";

export function isProductTemplateId(value: string): value is ProductTemplateId {
  return (PRODUCT_TEMPLATE_IDS as readonly string[]).includes(value);
}

export function resolveTemplateId(
  value: string | null | undefined,
  category?: Category
): ProductTemplateId {
  if (value && isProductTemplateId(value)) return value;
  if (value === "premium-minimal" || value === "minimal") {
    return category === Category.EQUIPMENT ? "equipment-showcase" : "tractor-cinematic";
  }
  return category ? defaultTemplateFor(category) : DEFAULT_TEMPLATE;
}

export function recommendedTemplates(category: Category): TemplateMeta[] {
  const match = TEMPLATE_CATALOG.find((item) => item.categories.includes(category));
  return match ? [{ ...match, name: "Standart Ürün Sayfası", description: "Tüm ürünler aynı kurumsal detay sayfasını kullanır." }] : [];
}

export const TRACTOR_SPEC_FIELDS = [
  { key: "Motori", label: "Motor" },
  { key: "Transmisioni", label: "Şanzıman" },
  { key: "Hidraulika", label: "Hidrolik" },
  { key: "PTO", label: "PTO" },
  { key: "Dimensionet", label: "Ölçüler" },
  { key: "Pesha", label: "Ağırlık" },
  { key: "Gomat", label: "Lastik bilgisi" },
  { key: "Kapaciteti i karburantit", label: "Yakıt kapasitesi" },
] as const;

export const EQUIPMENT_SPEC_FIELDS = [
  { key: "Gjerësia e punës", label: "Çalışma genişliği" },
  { key: "Kapaciteti", label: "Kapasite" },
  { key: "Pesha", label: "Ağırlık" },
  { key: "HP e nevojshme", label: "Gerekli traktör HP" },
  { key: "Dimensionet", label: "Ölçüler" },
  { key: "Disk / thikë", label: "Disk / bıçak / adet" },
  { key: "Lidhja", label: "Bağlantı tipi" },
] as const;

export const TRACTOR_SUBCATEGORIES = ["Orchard", "Field", "Cabin", "ROPS"] as const;

export const EQUIPMENT_SUBCATEGORIES = [
  "Kultivator",
  "Çizel",
  "Rotovator",
  "Plug",
  "Plehë shpërndarës",
  "Spërkatës",
  "Diskaro",
  "Tesviye",
  "Kositje",
  "Other",
] as const;

export const EQUIPMENT_GROUPS = [
  { id: "punimi", label: "Punimi i Tokës", types: ["Kultivator", "Çizel", "Rotovator", "Plug", "Diskaro", "Tesviye"] },
  { id: "plehrimi", label: "Plehrimi", types: ["Plehë shpërndarës"] },
  { id: "sperkatja", label: "Spërkatja", types: ["Spërkatës"] },
  { id: "kositja", label: "Kositja", types: ["Kositje"] },
  { id: "te-tjera", label: "Të tjera", types: ["Other"] },
] as const;

export const HP_RANGES = [
  { id: "50-80", label: "50-80 HP", min: 50, max: 80 },
  { id: "80-100", label: "80-100 HP", min: 80, max: 100 },
  { id: "100+", label: "100+ HP", min: 100, max: undefined },
] as const;
