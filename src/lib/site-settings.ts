export const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3014.720848428033!2d19.697975176632845!3d40.92186622474014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135005a630bc5ec3%3A0x621aca5ad69934d!2sTerraFerroTech!5e0!3m2!1str!2str!4v1786942419249!5m2!1str!2str";

export type PublicSiteSettings = {
  companyName: string;
  email: string;
  phone: string;
  phoneHref: string;
  location: string;
  mapEmbedUrl: string;
  website: string;
  whatsapp: string;
  usedTractorsEnabled: boolean;
};

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  companyName: "Terra Ferro Tech",
  email: "terraferrotech@gmail.com",
  phone: "+355 75 237 83 83",
  phoneHref: "+355752378383",
  location: "Lushnje, Albania",
  mapEmbedUrl: DEFAULT_MAP_EMBED_URL,
  website: "www.terraferrotech.com",
  whatsapp: "355752378383",
  usedTractorsEnabled: false,
};

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function toPhoneHref(phone: string) {
  const digits = digitsOnly(phone);
  if (!digits) return DEFAULT_SITE_SETTINGS.phoneHref;
  return digits.startsWith("355") ? `+${digits}` : `+${digits}`;
}

export function toWhatsapp(phone: string) {
  const digits = digitsOnly(phone);
  return digits || DEFAULT_SITE_SETTINGS.whatsapp;
}

export function extractMapEmbedUrl(input: string) {
  const raw = input.trim();
  if (!raw) return "";
  const srcMatch = raw.match(/src=["']([^"']+)["']/i);
  const candidate = srcMatch?.[1] ?? raw;
  try {
    const url = new URL(candidate);
    if (url.hostname.includes("google.com") && url.pathname.includes("/maps/embed")) {
      return url.toString();
    }
  } catch {
    return "";
  }
  return "";
}
