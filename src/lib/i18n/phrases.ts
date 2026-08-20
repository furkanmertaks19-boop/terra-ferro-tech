import { getDictionary, type Messages } from "./dictionaries";
import type { Locale } from "./config";

export function foldUi(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type Pick = (t: Messages) => string;

const EXACT: Record<string, Pick> = {
  "gjej modelin": (t) => t.home.findModel,
  "shiko traktoret": (t) => t.home.exploreTractors,
  "shiko traktor": (t) => t.home.exploreTractors,
  "shiko te gjithe traktoret": (t) => t.home.viewAllTractors,
  "shiko makinerite": (t) => t.home.viewEquipment,
  "shiko modelin": (t) => t.home.viewModel,
  "shiko detajet": (t) => t.productList.viewDetails,
  "shiko galerine": (t) => t.home.galleryCta,
  "kerko oferte": (t) => t.nav.quote,
  "kerkoni makinen e duhur": (t) => t.home.ctaNeedMachine,
  "flisni me ekipin tone": (t) => t.home.ctaTalk,
  "na kontaktoni": (t) => t.home.contactUs,
  "rreth nesh": (t) => t.nav.about,
  "makineri bujqesore": (t) => t.nav.equipment,
  traktoret: (t) => t.nav.tractors,
  sherbimet: (t) => t.nav.services,
  galeria: (t) => t.nav.gallery,
  kontakt: (t) => t.nav.contact,
  "modelet e zgjedhura te traktoreve": (t) => t.home.featuredTitle,
  "zgjidhni nga modelet me te pershtatshme per pemishte fusha dhe perdorim te perditshem": (t) =>
    t.home.featuredTractorsBody,
  "makineri per token": (t) => t.home.equipmentHeadline,
  "kultivatore rotovatore plugje dhe pajisje nga katalogu": (t) => t.home.equipmentBody,
  "nga zgjedhja te servisi": (t) => t.home.servicesHeadline,
  "momente nga terra ferro tech": (t) => t.home.galleryHeadline,
  "foto dhe video nga makinerite dorezimet dhe puna ne terren": (t) => t.home.galleryBody,
  "partneri juaj ne mekanizimin bujqesor": (t) => t.about.headline,
  kabine: (t) => t.productList.cabin,
  modeli: (t) => t.home.modelLabel,
  seria: (t) => t.home.seriesLabel,
  "te gjitha": (t) => t.home.allOptions,
  fuqia: (t) => t.home.powerLabel,
  "shiko pdf ne": (t) => t.productDetail.pdfView,
};

export function localizeKnownUi(text: string | null | undefined, locale: Locale): string {
  const value = (text ?? "").trim();
  if (!value || locale === "sq") return value;
  const t = getDictionary(locale);
  const key = foldUi(value);
  const mapped = EXACT[key];
  if (mapped) return mapped(t);
  for (const [needle, pick] of Object.entries(EXACT)) {
    if (needle.length >= 12 && key.includes(needle)) return pick(t);
  }
  return value;
}
