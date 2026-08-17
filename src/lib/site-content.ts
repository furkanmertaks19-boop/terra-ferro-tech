export const NAV_LINKS = [
  { href: "/", label: "Ballina" },
  { href: "/rreth-nesh", label: "Rreth Nesh" },
  { href: "/traktoret", label: "Traktorët" },
  { href: "/makineri-bujqesore", label: "Makineri Bujqësore" },
  { href: "/galeri", label: "Galeria" },
  { href: "/sherbimet", label: "Shërbimet" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const SERVICES = [
  {
    title: "Konsulencë për zgjedhjen e traktorit",
    body: "Ju ndihmojmë të zgjidhni modelin, serinë dhe fuqinë e duhur për tokën dhe kulturat tuaja.",
  },
  {
    title: "Shitje",
    body: "Gama Armatrac e traktorëve dhe makinerive bujqësore, me këshillim të drejtpërdrejtë nga ekipi ynë.",
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
  body: "Terra Ferro Tech është përfaqësues i traktorëve dhe makinerive bujqësore Armatrac në Shqipëri. Ofrojmë shitje, këshillim teknik dhe pjesë këmbimi për fermerët dhe bizneset bujqësore.",
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
