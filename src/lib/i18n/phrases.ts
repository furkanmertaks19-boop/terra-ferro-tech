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
  "fuqia per cdo toke": (t) => t.home.slidePowerEyebrow,
  "fuqia qe leviz bujqesine": (t) => t.home.slidePowerTitle,
  "traktore armatrac per pemishte sera dhe fusha te hapura me keshillim dhe mbeshtetje ne shqiperi": (t) =>
    t.home.slidePowerSubtitle,
  "pajisjet qe perfundin punen": (t) => t.home.slideEquipTitle,
  "kultivatore rotovatore plugje dhe sperkatese te pershtatura me gamen e traktoreve tane": (t) => t.home.slideEquipSubtitle,
  "partneri juaj pas shitjes": (t) => t.home.slideServiceTitle,
  "zgjedhje e modelit pjese kembimi dhe mbeshtetje teknike per fermeret ne te gjithe vendin": (t) =>
    t.home.slideServiceSubtitle,
  "kerkoni sipas modelit serise ose fuqise": (t) => t.home.findModelBody,
  "terra ferro tech eshte perfaqesues i traktoreve dhe makinerive bujqesore armatrac ne shqiperi ofrojme shitje keshillim teknik dhe pjese kembimi per fermeret dhe bizneset bujqesore":
    (t) => t.about.body,
  "shitje e drejtperdrejte": (t) => t.about.value1Title,
  "modele te zgjedhura sipas kushteve reale te tokes jo katalogu i pergjithshem": (t) => t.about.value1Body,
  "servis dhe pjese": (t) => t.about.value2Title,
  "makina mbetet ne fushe vetem nese ka mbeshtetje pas shitjes": (t) => t.about.value2Body,
  "prani lokale": (t) => t.about.value3Title,
  "bazuar ne lushnje me kontakt te drejtperdrejte per fermeret ne shqiperi": (t) => t.about.value3Body,
  "cfare ofrojme": (t) => t.pages.whatWeOffer,
  "foto dhe video": (t) => t.pages.galleryHeroTitle,
  "momente nga terra ferro tech traktoret makinerite dhe puna ne terren": (t) => t.pages.galleryHeroBody,
  "nga zgjedhja e modelit deri te pjeset e kembimit ju qendrojme prane pas shitjes": (t) => t.pages.servicesHeroBody,
  "na shkruani ose na telefononi ekipi yne ju kthen pergjigje sa me shpejt": (t) => t.pages.contactHeroBody,
  "dergoni nje mesazh": (t) => t.pages.formTitle,
  dergo: (t) => t.pages.send,
  "emri dhe mbiemri": (t) => t.quoteForm.name,
  telefoni: (t) => t.quoteForm.phone,
  subjekti: (t) => t.pages.subject,
  mesazhi: (t) => t.quoteForm.message,
  vendndodhja: (t) => t.pages.location,
  "gama e produkteve": (t) => t.pages.productRange,
  "fuqi efikasitet dhe teknologji per cdo lloj pune bujqesore": (t) => t.pages.tractorsHeroBody,
  "pajisje moderne per punimin e tokes plehrimin dhe mbrojtjen e kulturave": (t) => t.pages.equipmentHeroBody,
  "konsulence per zgjedhjen e traktorit": (t) => t.services.consultTitle,
  "ju ndihmojme te zgjidhni modelin serine dhe fuqine e duhur per token dhe kulturat tuaja": (t) => t.services.consultBody,
  shitje: (t) => t.services.salesTitle,
  "gama armatrac e traktoreve dhe makinerive bujqesore me keshillim te drejtperdrejte nga ekipi yne": (t) =>
    t.services.salesBody,
  "pjese kembimi": (t) => t.services.partsTitle,
  "furnizim me pjese per te mbajtur makinerine ne pune gjate sezonit": (t) => t.services.partsBody,
  "mbeshtetje teknike": (t) => t.services.supportTitle,
  "mbeshtetje pas shitjes per perdorimin dhe mirembajtjen e pajisjeve": (t) => t.services.supportBody,
  servis: (t) => t.services.serviceTitle,
  "sherbim per makinerine qe keni blere qe puna ne fushe te mos ndalet": (t) => t.services.serviceBody,
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
