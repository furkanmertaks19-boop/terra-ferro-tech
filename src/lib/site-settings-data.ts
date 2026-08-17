import { prisma, withPrismaRetry } from "./prisma";
import {
  DEFAULT_MAP_EMBED_URL,
  DEFAULT_SITE_SETTINGS,
  extractMapEmbedUrl,
  toWhatsapp,
  type PublicSiteSettings,
} from "./site-settings";

function mapSettings(row: {
  companyName: string;
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  mapEmbedUrl: string;
  website: string;
  whatsapp: string;
}): PublicSiteSettings {
  return {
    companyName: row.companyName,
    email: row.email,
    phone: row.phone,
    phoneHref: row.phoneHref,
    location: row.location,
    mapEmbedUrl: extractMapEmbedUrl(row.mapEmbedUrl) || DEFAULT_MAP_EMBED_URL,
    website: row.website,
    whatsapp: row.whatsapp || toWhatsapp(row.phoneHref || row.phone),
  };
}

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  try {
    const row = await withPrismaRetry(() => prisma.siteSettings.findUnique({ where: { id: "default" } }));
    return row ? mapSettings(row) : DEFAULT_SITE_SETTINGS;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
