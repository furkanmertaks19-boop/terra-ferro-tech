import type { Category, Product, ProductStatus } from "@prisma/client";
import type { ContentBlock, SpecGroup } from "@/lib/admin-content";
import { resolveHeroImageMode, type HeroImageMode } from "@/lib/hero-image-mode";
import { resolveTemplateId, type ProductTemplateId } from "@/lib/templates";

export type ProductRevision = {
  category: Category;
  template: ProductTemplateId;
  series: string;
  subcategory: string | null;
  name: string;
  fullTitle: string;
  stage: string | null;
  horsePower: number | null;
  hasCabin: boolean;
  featured: boolean;
  isCampaign: boolean;
  isNew: boolean;
  customBadge: string | null;
  customBadgeTone: string | null;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  slug: string;
  images: string[];
  imageAlts: Record<string, string>;
  specGroups: SpecGroup[];
  specs: Record<string, string>;
  contentBlocks: ContentBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  technicalPdfName: string | null;
  technicalPdfSize: number | null;
  showTechnicalPdf: boolean;
  heroImageMode: HeroImageMode;
};

export function parseDraftRevision(value: unknown): ProductRevision | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ProductRevision> & { template?: string };
  if (typeof raw.name !== "string" || typeof raw.slug !== "string") return null;
  return {
    category: raw.category === "EQUIPMENT" ? "EQUIPMENT" : "TRACTOR",
    template: resolveTemplateId(raw.template, raw.category === "EQUIPMENT" ? "EQUIPMENT" : "TRACTOR"),
    series: raw.series ?? "",
    subcategory: raw.subcategory ?? null,
    name: raw.name,
    fullTitle: raw.fullTitle || raw.name,
    stage: raw.stage ?? null,
    horsePower: raw.horsePower ?? null,
    hasCabin: Boolean(raw.hasCabin),
    featured: Boolean(raw.featured),
    isCampaign: Boolean(raw.isCampaign),
    isNew: Boolean(raw.isNew),
    customBadge: typeof raw.customBadge === "string" ? raw.customBadge : null,
    customBadgeTone: typeof raw.customBadgeTone === "string" ? raw.customBadgeTone : null,
    shortDescription: raw.shortDescription ?? null,
    description: raw.description ?? null,
    coverImage: raw.coverImage ?? null,
    slug: raw.slug,
    images: Array.isArray(raw.images) ? raw.images.filter((src): src is string => typeof src === "string") : [],
    imageAlts: raw.imageAlts && typeof raw.imageAlts === "object" ? raw.imageAlts : {},
    specGroups: Array.isArray(raw.specGroups) ? raw.specGroups : [],
    specs: raw.specs && typeof raw.specs === "object" ? raw.specs : {},
    contentBlocks: Array.isArray(raw.contentBlocks) ? raw.contentBlocks : [],
    seoTitle: raw.seoTitle ?? null,
    seoDescription: raw.seoDescription ?? null,
    technicalPdfUrl: raw.technicalPdfUrl ?? null,
    technicalPdfPublicId: raw.technicalPdfPublicId ?? null,
    technicalPdfName: raw.technicalPdfName ?? null,
    technicalPdfSize: raw.technicalPdfSize ?? null,
    showTechnicalPdf: Boolean(raw.showTechnicalPdf),
    heroImageMode: resolveHeroImageMode(raw.heroImageMode),
  };
}

export function applyRevisionToProduct<T extends Product>(product: T, revision: ProductRevision | null): T {
  if (!revision) return product;
  return {
    ...product,
    category: revision.category,
    template: revision.template,
    series: revision.series,
    subcategory: revision.subcategory,
    name: revision.name,
    fullTitle: revision.fullTitle,
    stage: revision.stage,
    horsePower: revision.horsePower,
    hasCabin: revision.hasCabin,
    shortDescription: revision.shortDescription,
    description: revision.description,
    coverImage: revision.coverImage,
    slug: revision.slug,
    images: revision.images,
    imageAlts: revision.imageAlts,
    specs: revision.specs,
    specGroups: revision.specGroups,
    contentBlocks: revision.contentBlocks,
    seoTitle: revision.seoTitle,
    seoDescription: revision.seoDescription,
    technicalPdfUrl: revision.technicalPdfUrl,
    technicalPdfPublicId: revision.technicalPdfPublicId,
    technicalPdfName: revision.technicalPdfName,
    technicalPdfSize: revision.technicalPdfSize,
    showTechnicalPdf: revision.showTechnicalPdf,
    heroImageMode: revision.heroImageMode,
  };
}

export function editorProduct(product: Product): Product {
  if (!product.hasUnpublishedChanges) return product;
  return applyRevisionToProduct(product, parseDraftRevision(product.draftRevision));
}

export function contentFingerprint(input: {
  template: string;
  series: string;
  subcategory: string | null;
  name: string;
  fullTitle: string;
  stage: string | null;
  horsePower: number | null;
  hasCabin: boolean;
  shortDescription: string | null;
  description: string | null;
  coverImage: string | null;
  slug: string;
  images: string[];
  imageAlts: Record<string, string>;
  specGroups: unknown;
  contentBlocks: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  technicalPdfUrl: string | null;
  heroImageMode: string;
}): string {
  return JSON.stringify(input);
}

export type PublishState = {
  status: ProductStatus;
  hasUnpublishedChanges: boolean;
};
