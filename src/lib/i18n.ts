export {
  LOCALES as locales,
  DEFAULT_LOCALE as defaultLocale,
  type Locale,
  getDictionary,
} from "@/lib/i18n/index";
export { getDictionary as getMessages } from "@/lib/i18n/dictionaries";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Albanian UI dictionary. Prefer getDictionary(locale) or useT() on the public site. */
export const t = getDictionary(DEFAULT_LOCALE);
