import type { Metadata } from "next";
import { Category } from "@prisma/client";
import { productHref } from "@/lib/product-path";
import { usedTractorHref, usedTractorLabel, type PublicUsedTractor } from "@/lib/used-tractors";
import { alternatePaths, pathFor, localeFromPathname } from "@/lib/i18n/routing";
import { DEFAULT_LOCALE, LOCALES, LOCALE_OG, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/request";

export const SITE_URL = "https://www.terraferrotech.com";
export const SITE_NAME = "Terra Ferro Tech";
export const SITE_LOCALE = "sq_AL";
export const SITE_LANG = "sq";
export const SITE_EMAIL = "terraferrotech@gmail.com";
export const SITE_PHONE = "+355 75 237 83 83";
export const SITE_PHONE_E164 = "+355752378383";
export const SITE_LOCALITY = "Lushnje";
export const SITE_COUNTRY = "AL";
export const SITE_COUNTRY_NAME = "Shqipëri";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export const HOME_TITLE = "Terra Ferro Tech | Traktorë dhe Makineri Bujqësore në Shqipëri";
export const HOME_DESCRIPTION =
  "Terra Ferro Tech ofron traktorë ArmaTrac, makineri bujqësore, këshillim teknik dhe mbështetje për fermerët në Shqipëri, me qendër në Lushnje.";

export function localizedPageSeo(locale: Locale = DEFAULT_LOCALE) {
  const t = getDictionary(locale);
  return {
    home: { path: pathFor("home", locale), title: t.seo.homeTitle, description: t.seo.homeDescription, absoluteTitle: true as const },
    traktoret: { path: pathFor("tractors", locale), title: t.seo.tractorsTitle, description: t.seo.tractorsDescription },
    equipment: { path: pathFor("equipment", locale), title: t.seo.equipmentTitle, description: t.seo.equipmentDescription },
    gallery: { path: pathFor("gallery", locale), title: t.seo.galleryTitle, description: t.seo.galleryDescription },
    about: { path: pathFor("about", locale), title: t.seo.aboutTitle, description: t.seo.aboutDescription },
    services: { path: pathFor("services", locale), title: t.seo.servicesTitle, description: t.seo.servicesDescription },
    contact: { path: pathFor("contact", locale), title: t.seo.contactTitle, description: t.seo.contactDescription },
    used: { path: pathFor("used", locale), title: t.seo.usedTitle, description: t.seo.usedDescription },
  };
}

export const PAGE_SEO = localizedPageSeo("sq");
export const USED_TRACTORS_SEO = localizedPageSeo("sq").used;

export async function localePageMetadata(
  key: keyof ReturnType<typeof localizedPageSeo>,
  extra?: { index?: boolean; image?: string | null },
) {
  const locale = await getRequestLocale();
  const page = localizedPageSeo(locale)[key];
  return publicPageMetadata({ ...page, ...extra, locale });
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function isProductionIndexingEnabled() {
  const flag = process.env.SEO_INDEXING?.trim().toLowerCase();
  if (flag === "0" || flag === "false") return false;
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") return false;
  return true;
}

export function robotsDirective(index = true): NonNullable<Metadata["robots"]> {
  if (!isProductionIndexingEnabled() || !index) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    };
  }
  return { index: true, follow: true };
}

export function publicPageMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
  image,
  index = true,
  locale,
}: {
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  image?: string | null;
  index?: boolean;
  locale?: Locale;
}): Metadata {
  const loc = locale ?? localeFromPathname(path);
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE);
  const alts = alternatePaths(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: {
        sq: absoluteUrl(alts.sq),
        en: absoluteUrl(alts.en),
        tr: absoluteUrl(alts.tr),
        "x-default": absoluteUrl(alts.sq),
      },
    },
    robots: robotsDirective(index),
    openGraph: {
      type: "website",
      locale: LOCALE_OG[loc],
      url,
      siteName: SITE_NAME,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

function plainText(value: string | null | undefined, max = 160) {
  const text = (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function hpLabel(horsePower: number | null | undefined) {
  if (horsePower == null || !Number.isFinite(horsePower)) return null;
  return Number.isInteger(horsePower) ? String(horsePower) : String(horsePower);
}

export { productImageAlt } from "@/lib/product-path";

export function productSeoTitle(product: {
  name: string;
  category: Category;
  horsePower?: number | null;
  seoTitle?: string | null;
}) {
  const custom = product.seoTitle?.trim();
  if (custom) return custom.replace(/\s*\|\s*Terra Ferro Tech\s*$/i, "");
  if (product.category === Category.TRACTOR) {
    const hp = hpLabel(product.horsePower);
    return hp ? `${product.name} – Traktor ArmaTrac ${hp} HP` : `${product.name} – Traktor ArmaTrac`;
  }
  return product.name;
}

export function productSeoDescription(product: {
  name: string;
  category: Category;
  horsePower?: number | null;
  series?: string | null;
  hasCabin?: boolean;
  stage?: string | null;
  subcategory?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seoDescription?: string | null;
}) {
  const custom = plainText(product.seoDescription, 160);
  if (custom) return custom;

  const fromCopy = plainText(product.shortDescription || product.description, 140);
  if (fromCopy) {
    const suffix = getDictionary(DEFAULT_LOCALE).seo.quoteSuffix;
    return plainText(`${fromCopy}${fromCopy.endsWith(".") ? "" : "."}${suffix}`, 160);
  }

  if (product.category === Category.TRACTOR) {
    const hp = hpLabel(product.horsePower);
    const bits = [`Zbuloni ArmaTrac ${product.name}`];
    if (hp) bits[0] += ` me fuqi ${hp} HP`;
    const extras = [
      product.hasCabin ? "me kabinë" : null,
      !product.hasCabin ? "me ROPS" : null,
      product.stage || null,
      product.series || null,
    ].filter(Boolean);
    const extra = extras.length ? ` ${extras.join(", ")}.` : ".";
    return plainText(`${bits[0]}${extra} Shikoni specifikimet teknike dhe kërkoni ofertë nga Terra Ferro Tech në Shqipëri.`, 160);
  }

  const kind = product.subcategory || product.series;
  const lead = kind
    ? `Shikoni ${product.name} (${kind}) nga Terra Ferro Tech.`
    : `Shikoni ${product.name} nga Terra Ferro Tech.`;
  return plainText(`${lead} Specifikime teknike dhe kërkesë për ofertë në Shqipëri.`, 160);
}

export async function productMetadata(product: {
  name: string;
  slug: string;
  category: Category;
  horsePower?: number | null;
  series?: string | null;
  hasCabin?: boolean;
  stage?: string | null;
  subcategory?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const path = productHref(product, locale);
  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  const image = product.coverImage || product.images?.find(Boolean) || null;
  return publicPageMetadata({ path, title, description, image, locale });
}

export function organizationJsonLd(settings?: {
  companyName?: string;
  email?: string;
  phone?: string;
  phoneHref?: string;
  location?: string;
  website?: string;
}) {
  const name = settings?.companyName?.trim() || SITE_NAME;
  const email = settings?.email?.trim() || SITE_EMAIL;
  const telephone = settings?.phoneHref?.trim() || settings?.phone?.trim() || SITE_PHONE_E164;
  const locality = settings?.location?.includes("Lushnje") || settings?.location?.includes("Lushnjë")
    ? SITE_LOCALITY
    : settings?.location?.split(",")[0]?.trim() || SITE_LOCALITY;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    email,
    telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressCountry: SITE_COUNTRY,
    },
    areaServed: {
      "@type": "Country",
      name: SITE_COUNTRY_NAME,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANG,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  category: Category;
  shortDescription?: string | null;
  description?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
  series?: string | null;
  subcategory?: string | null;
}) {
  const url = absoluteUrl(productHref(product));
  const images = [product.coverImage, ...(product.images ?? [])].filter((src): src is string => Boolean(src));
  const description = productSeoDescription(product);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    url,
    image: images.length ? images.map((src) => absoluteUrl(src)) : undefined,
    category: product.category === Category.TRACTOR ? "Traktorë" : product.subcategory || "Makineri Bujqësore",
  };
  if (product.category === Category.TRACTOR) {
    data.brand = { "@type": "Brand", name: "ArmaTrac" };
    data.model = product.name;
  }
  return data;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function productBreadcrumbJsonLd(product: { name: string; slug: string; category: Category }) {
  const catalog =
    product.category === Category.TRACTOR
      ? { name: "Traktorët", path: "/traktoret" }
      : { name: "Makineri Bujqësore", path: "/makineri-bujqesore" };
  return breadcrumbJsonLd([
    { name: "Ballina", path: "/" },
    catalog,
    { name: product.name, path: productHref(product) },
  ]);
}

export async function usedTractorMetadata(item: PublicUsedTractor): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const customTitle = item.seoTitle?.trim().replace(/\s*\|\s*Terra Ferro Tech\s*$/i, "");
  const title = customTitle || `${usedTractorLabel(item)}`;
  const customDescription = plainText(item.seoDescription, 160);
  const fromCopy = plainText(item.shortDescription || item.description, 140);
  const description = customDescription || (fromCopy ? plainText(`${fromCopy}${fromCopy.endsWith(".") ? "" : "."}${t.seo.quoteSuffix}`, 160) : t.seo.usedDescription);
  return publicPageMetadata({
    path: usedTractorHref(item.slug, locale),
    title,
    description,
    image: item.coverImage || item.images.find(Boolean) || null,
    locale,
  });
}

export function usedTractorJsonLd(item: PublicUsedTractor) {
  const images = [item.coverImage, ...item.images].filter((src): src is string => Boolean(src));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: usedTractorLabel(item),
    description: item.shortDescription || item.description || `${usedTractorLabel(item)} i përdorur.`,
    url: absoluteUrl(usedTractorHref(item.slug)),
    image: images.length ? images.map((src) => absoluteUrl(src)) : undefined,
    category: "Traktorë të përdorur",
    brand: { "@type": "Brand", name: item.brand },
    model: item.model,
    itemCondition: "https://schema.org/UsedCondition",
  };
}

export function usedTractorBreadcrumbJsonLd(item: PublicUsedTractor) {
  return breadcrumbJsonLd([
    { name: "Ballina", path: "/" },
    { name: "Traktorë të Përdorur", path: USED_TRACTORS_SEO.path },
    { name: usedTractorLabel(item), path: usedTractorHref(item.slug) },
  ]);
}
