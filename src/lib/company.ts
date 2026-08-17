import { DEFAULT_SITE_SETTINGS } from "./site-settings";

/** @deprecated Use getSiteSettings() for live values. Defaults stay in sync with SiteSettings. */
export const COMPANY = {
  name: DEFAULT_SITE_SETTINGS.companyName,
  address: DEFAULT_SITE_SETTINGS.location,
  phoneDisplay: DEFAULT_SITE_SETTINGS.phone,
  phoneRaw: DEFAULT_SITE_SETTINGS.phoneHref,
  website: DEFAULT_SITE_SETTINGS.website,
  whatsapp: DEFAULT_SITE_SETTINGS.whatsapp,
  email: DEFAULT_SITE_SETTINGS.email,
} as const;
