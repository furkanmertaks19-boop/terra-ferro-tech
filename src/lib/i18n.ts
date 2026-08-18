// Simple dictionary-based i18n. Only "sq" (Albanian) is populated today, but the
// shape supports adding more locales later without touching call sites.

export const locales = ["sq"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sq";

const sq = {
  nav: {
    home: "Ballina",
    tractors: "Traktorët",
    equipment: "Makineri Bujqësore",
    about: "Rreth Nesh",
    services: "Shërbimet",
    contact: "Kontakt",
    gallery: "Galeria",
    quote: "Kërko Ofertë",
    usedTractors: "Traktorë të Përdorur",
  },
  home: {
    heroTitle: "Terra Ferro Tech",
    heroSubtitle:
      "Traktorë dhe makineri bujqësore ArmaTrac — fuqi, qëndrueshmëri dhe shërbim i besueshëm në Shqipëri.",
    searchPlaceholder: "Kërko sipas modelit, serisë ose fuqisë (HP)...",
    searchButton: "Kërko",
    viewTractors: "Shiko Traktorët",
    viewEquipment: "Shiko Makineritë",
    categoriesTitle: "Kategoritë Tona",
    tractorsCardTitle: "Traktorë",
    tractorsCardDesc:
      "Seria Orchard (Bahçe) dhe Field (Tarla) — nga 50 HP deri 110 HP, me ose pa kabinë.",
    equipmentCardTitle: "Makineri Bujqësore",
    equipmentCardDesc:
      "Kultivatorë, çizel, rotovatorë, plugje, spërkatëse dhe pajisje të tjera ndihmëse.",
    aboutTitle: "Rreth Terra Ferro Tech",
    aboutText:
      "Terra Ferro Tech është përfaqësuesi i traktorëve dhe makinerive bujqësore ArmaTrac në Shqipëri. Ofrojmë cilësi, mbështetje teknike dhe pjesë këmbimi për fermerët dhe bizneset bujqësore në të gjithë vendin.",
    featuredTitle: "Modele të Zgjedhura",
  },
  productList: {
    tractorsTitle: "Traktorë",
    equipmentTitle: "Makineri Bujqësore",
    filters: "Filtro",
    series: "Seria",
    allSeries: "Të gjitha seritë",
    horsePower: "Fuqia (HP)",
    cabin: "Kabinë",
    withCabin: "Me kabinë",
    withoutCabin: "Pa kabinë (Rops)",
    stage: "Stage",
    priceRange: "Çmimi",
    sortBy: "Rendit sipas",
    sortNewest: "Më të rejat",
    sortPriceAsc: "Çmimi: I ulët → I lartë",
    sortPriceDesc: "Çmimi: I lartë → I ulët",
    sortHpAsc: "HP: I ulët → I lartë",
    sortHpDesc: "HP: I lartë → I ulët",
    noResults: "Nuk u gjet asnjë produkt me këto filtra.",
    resetFilters: "Pastro filtrat",
    resultsCount: "produkte",
    campaignBadge: "OFERTË",
    newBadge: "E RE",
    requestQuote: "Kërko Ofertë",
    viewDetails: "Shiko Detajet",
  },
  productDetail: {
    specsTitle: "Specifikimet teknike",
    descriptionTitle: "Rreth produktit",
    overviewEyebrow: "Përmbledhje",
    highlightsTitle: "Të dhënat kryesore",
    featuresTitle: "Veçoritë kryesore",
    galleryTitle: "Galeria",
    pdfTitle: "Dokumentacion teknik",
    pdfBody: "Shikoni dokumentin teknik të këtij modeli.",
    pdfView: "Shiko PDF-në",
    pdfDownload: "Shkarko",
    similarTitle: "Modele të ngjashme",
    requestQuote: "Kërko Ofertë",
    contact: "Kontaktoni",
    viewGallery: "Shiko galerinë",
    viewSpecs: "Shiko specifikimet",
    offerTitle: "Dëshironi çmim dhe informacion të detajuar për këtë model?",
    offerBody: "Ekipi ynë ju dërgon ofertë dhe të dhëna teknike sipas nevojës suaj.",
    priceLabel: "Çmimi",
    priceOnRequest: "Çmimi me kërkesë",
    horsePower: "Fuqia",
    series: "Seria",
    stage: "Stage",
    cabinType: "Tipi",
    cabin: "Kabinë",
    rops: "ROPS",
    capacityCompatible: "HP traktori i përputhshëm",
    backToList: "Kthehu te lista",
    noImage: "Imazhi së shpejti",
  },
  quoteForm: {
    title: "Kërko Ofertë",
    subtitle: "Plotëso të dhënat dhe do të kontaktohesh sa më shpejt.",
    name: "Emri dhe Mbiemri",
    phone: "Telefoni",
    email: "Email",
    product: "Produkti",
    message: "Mesazhi",
    submit: "Dërgo Kërkesën",
    submitting: "Duke dërguar...",
    success: "Faleminderit! Kërkesa juaj u dërgua me sukses. Do t'ju kontaktojmë së shpejti.",
    error: "Diçka shkoi keq. Ju lutem provoni përsëri ose na kontaktoni në telefon.",
    orWhatsapp: "ose kontakto direkt në WhatsApp",
  },
  footer: {
    address: "Adresa",
    phone: "Telefoni",
    website: "Website",
    rights: "Të gjitha të drejtat e rezervuara.",
  },
  common: {
    loading: "Duke ngarkuar...",
    hp: "HP",
  },
} as const;

const dictionaries: Record<Locale, typeof sq> = { sq };

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}

export const t = getDictionary(defaultLocale);
