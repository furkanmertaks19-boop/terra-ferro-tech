import { getDictionary, type Messages } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pathFor } from "@/lib/i18n/routing";

export type PublicNavLink = { href: string; label: string };

export function publicNavLinks(usedTractorsEnabled: boolean, locale: Locale = DEFAULT_LOCALE, dict?: Messages): PublicNavLink[] {
  const t = dict ?? getDictionary(locale);
  const links: PublicNavLink[] = [
    { href: pathFor("home", locale), label: t.nav.home },
    { href: pathFor("about", locale), label: t.nav.about },
    { href: pathFor("tractors", locale), label: t.nav.tractors },
    { href: pathFor("equipment", locale), label: t.nav.equipment },
    { href: pathFor("gallery", locale), label: t.nav.gallery },
    { href: pathFor("services", locale), label: t.nav.services },
    { href: pathFor("contact", locale), label: t.nav.contact },
  ];
  if (!usedTractorsEnabled) return links;
  const index = links.findIndex((link) => link.href === pathFor("tractors", locale));
  links.splice(index + 1, 0, { href: pathFor("used", locale), label: t.nav.usedTractors });
  return links;
}

export const NAV_LINKS = publicNavLinks(false);
export const USED_TRACTORS_NAV = { href: pathFor("used"), label: getDictionary().nav.usedTractors };

export const SERVICES = [
  {
    title: "Konsulencë për zgjedhjen e traktorit",
    body: "Ju ndihmojmë të zgjidhni modelin, serinë dhe fuqinë e duhur për tokën dhe kulturat tuaja.",
  },
  {
    title: "Shitje",
    body: "Gama ArmaTrac e traktorëve dhe makinerive bujqësore, me këshillim të drejtpërdrejtë nga ekipi ynë.",
  },
  {
    title: "Pjesë këmbimi",
    body: "Furnizim me pjesë për të mbajtur makinerinë në punë gjatë sezonit.",
  },
  {
    title: "Mbështetje teknike",
    body: "Mbështetje pas shitjes për përdorimin dhe mirëmbajtjen e pajisjeve.",
  },
  {
    title: "Servis",
    body: "Shërbim për makinerinë që keni blerë, që puna në fushë të mos ndalet.",
  },
] as const;

export const TRUST_STATS = {
  enabled: false,
  items: [] as { value: number; suffix: string; label: string }[],
};

export const ABOUT = {
  headline: "Partneri juaj në mekanizimin bujqësor.",
  body: "Terra Ferro Tech është përfaqësues i traktorëve dhe makinerive bujqësore ArmaTrac në Shqipëri. Ofrojmë shitje, këshillim teknik dhe pjesë këmbimi për fermerët dhe bizneset bujqësore.",
  values: [
    {
      title: "Shitje e drejtpërdrejtë",
      body: "Modele të zgjedhura sipas kushteve reale të tokës, jo katalogu i përgjithshëm.",
    },
    {
      title: "Servis dhe pjesë",
      body: "Makina mbetet në fushë vetëm nëse ka mbështetje pas shitjes.",
    },
    {
      title: "Prani lokale",
      body: "Bazuar në Lushnjë, me kontakt të drejtpërdrejtë për fermerët në Shqipëri.",
    },
  ],
} as const;
