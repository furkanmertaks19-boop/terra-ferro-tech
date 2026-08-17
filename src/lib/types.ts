import type { Product as PrismaProduct } from "@prisma/client";
import type { ContentBlock, SpecGroup } from "@/lib/admin-content";

export type AdminProduct = Omit<
  PrismaProduct,
  "dealerPrice" | "retailPrice" | "specs" | "specGroups" | "contentBlocks" | "imageAlts"
> & {
  dealerPrice: number;
  retailPrice: number;
  specs: Record<string, string>;
  specGroups: SpecGroup[] | null;
  contentBlocks: ContentBlock[];
  imageAlts: Record<string, string>;
  referenceUrl?: string | null;
  customBadge?: string | null;
  customBadgeTone?: string | null;
};

/** @deprecated Use AdminProduct in admin, PublicProduct on the public site. */
export type ProductDTO = AdminProduct;

export type PublicProduct = Omit<
  PrismaProduct,
  | "dealerPrice"
  | "retailPrice"
  | "specs"
  | "theme"
  | "showPriceOnSite"
  | "technicalPdfPublicId"
  | "technicalPdfSize"
  | "technicalPdfName"
  | "showTechnicalPdf"
  | "draftRevision"
  | "hasUnpublishedChanges"
  | "referenceUrl"
  | "specGroups"
> & {
  specs: Record<string, string>;
  specGroups?: SpecGroup[] | null;
  contentBlocks?: ContentBlock[];
  technicalPdfUrl: string | null;
  customBadge?: string | null;
  customBadgeTone?: string | null;
};

export function toAdminProduct(product: PrismaProduct): AdminProduct {
  return {
    ...product,
    dealerPrice: Number(product.dealerPrice),
    retailPrice: Number(product.retailPrice),
    specs: (product.specs as Record<string, string>) ?? {},
    specGroups: (product.specGroups as SpecGroup[] | null) ?? null,
    contentBlocks: (product.contentBlocks as ContentBlock[]) ?? [],
    imageAlts: (product.imageAlts as Record<string, string>) ?? {},
    referenceUrl: "referenceUrl" in product ? ((product as { referenceUrl?: string | null }).referenceUrl ?? null) : null,
    customBadge: "customBadge" in product ? ((product as { customBadge?: string | null }).customBadge ?? null) : null,
    customBadgeTone: "customBadgeTone" in product ? ((product as { customBadgeTone?: string | null }).customBadgeTone ?? null) : null,
  };
}

export function toProductDTO(product: PrismaProduct): AdminProduct {
  return toAdminProduct(product);
}

export function usableImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const url = value.trim();
  if (!url || url.startsWith("blob:")) return null;
  return url;
}

export function toPublicProduct(product: {
  specs: unknown;
  dealerPrice?: unknown;
  theme?: unknown;
  showPriceOnSite?: unknown;
  retailPrice?: unknown;
  coverImage?: string | null;
  images?: string[];
  technicalPdfUrl?: string | null;
  technicalPdfPublicId?: string | null;
  technicalPdfName?: string | null;
  technicalPdfSize?: number | null;
  showTechnicalPdf?: boolean | null;
  [key: string]: unknown;
}): PublicProduct {
  const {
    dealerPrice: _dealerPrice,
    retailPrice: _retailPrice,
    specs,
    theme: _theme,
    showPriceOnSite: _showPrice,
    technicalPdfPublicId: _pdfPublicId,
    technicalPdfName: _pdfName,
    technicalPdfSize: _pdfSize,
    showTechnicalPdf,
    technicalPdfUrl,
    draftRevision: _draftRevision,
    hasUnpublishedChanges: _unpublished,
    referenceUrl: _referenceUrl,
    specGroups,
    ...rest
  } = product;
  void _dealerPrice;
  void _retailPrice;
  void _theme;
  void _showPrice;
  void _pdfPublicId;
  void _pdfName;
  void _pdfSize;
  void _draftRevision;
  void _unpublished;
  void _referenceUrl;
  const images = Array.isArray(product.images)
    ? product.images.map(usableImageUrl).filter((src): src is string => Boolean(src))
    : [];
  return {
    ...(rest as Omit<PublicProduct, "specs" | "specGroups" | "contentBlocks" | "coverImage" | "images" | "technicalPdfUrl">),
    specs: (specs as Record<string, string>) ?? {},
    specGroups: Array.isArray(specGroups) ? (specGroups as SpecGroup[]) : null,
    coverImage: usableImageUrl(product.coverImage),
    images,
    contentBlocks: (product.contentBlocks as ContentBlock[]) ?? [],
    technicalPdfUrl: showTechnicalPdf ? usableImageUrl(technicalPdfUrl) : null,
    customBadge: typeof product.customBadge === "string" ? product.customBadge : product.customBadge == null ? null : String(product.customBadge),
    customBadgeTone: typeof product.customBadgeTone === "string" ? product.customBadgeTone : product.customBadgeTone == null ? null : String(product.customBadgeTone),
  };
}

export function coverUrl(product: { coverImage?: string | null; images?: string[] | null }): string | null {
  return usableImageUrl(product.coverImage) || usableImageUrl(product.images?.[0]);
}

export function galleryUrls(product: { coverImage?: string | null; images?: string[] | null }): string[] {
  const images = (product.images ?? []).map(usableImageUrl).filter((src): src is string => Boolean(src));
  const cover = usableImageUrl(product.coverImage);
  const rest = images.filter((src) => src !== cover);
  return cover ? [cover, ...rest] : images;
}
