import { Category, ProductStatus } from "@prisma/client";
import { groupsToSpecs, type ContentBlock, type SpecGroup } from "@/lib/admin-content";
import { resolveHeroImageMode, type HeroImageMode } from "@/lib/hero-image-mode";
import { resolveTemplateId, type ProductTemplateId } from "@/lib/templates";
import type { PublicProduct } from "@/lib/types";

export function editorStateToPublicProduct(input: {
  id: string | null;
  category: Category;
  template: ProductTemplateId;
  status: ProductStatus;
  series: string;
  subcategory: string;
  name: string;
  fullTitle: string;
  slug: string;
  stage: string;
  horsePower: string;
  hasCabin: boolean;
  featured: boolean;
  isCampaign: boolean;
  isNew: boolean;
  customBadge?: string;
  customBadgeTone?: string | null;
  shortDescription: string;
  description: string;
  coverImage: string | null;
  images: string[];
  specGroups: SpecGroup[];
  contentBlocks: ContentBlock[];
  technicalPdfUrl: string | null;
  showTechnicalPdf: boolean;
  heroImageMode: HeroImageMode;
}): PublicProduct {
  const now = new Date();
  const slug = input.slug || "preview";
  const specs = groupsToSpecs(input.specGroups);
  return {
    id: input.id || "preview",
    category: input.category,
    template: resolveTemplateId(input.template, input.category),
    status: input.status,
    featured: input.featured,
    series: input.series,
    subcategory: input.subcategory || null,
    name: input.name || "Ürün adı",
    fullTitle: input.fullTitle || input.name || "Ürün adı",
    stage: input.stage || null,
    horsePower: input.horsePower ? Number(input.horsePower) : null,
    hasCabin: input.hasCabin,
    isCampaign: input.isCampaign,
    isNew: input.isNew,
    customBadge: input.customBadge?.trim() || null,
    customBadgeTone: input.customBadge?.trim() ? input.customBadgeTone || "red" : null,
    shortDescription: input.shortDescription || null,
    description: input.description || null,
    specs,
    specGroups: input.specGroups,
    imageAlts: {},
    seoTitle: null,
    seoDescription: null,
    coverImage: input.coverImage,
    images: input.images,
    contentBlocks: input.contentBlocks,
    slug,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
    heroImageMode: resolveHeroImageMode(input.heroImageMode),
    technicalPdfUrl: input.showTechnicalPdf ? input.technicalPdfUrl : null,
  };
}
