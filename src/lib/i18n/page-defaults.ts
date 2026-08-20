import { getDictionary } from "./dictionaries";
import type { Locale } from "./config";
import type { HomeSectionType } from "@/lib/home-section-types";
import { servicesList } from "@/lib/site-content";

export type CmsPageKey = "about" | "tractors" | "equipment" | "gallery" | "services" | "contact";

export function pageHeroDefaults(key: CmsPageKey, locale: Locale) {
  const t = getDictionary(locale);
  switch (key) {
    case "about":
      return { eyebrow: "Terra Ferro Tech", title: t.about.headline, description: t.about.body };
    case "tractors":
      return { eyebrow: t.pages.productRange, title: t.pages.tractorsHeroTitle, description: t.pages.tractorsHeroBody };
    case "equipment":
      return { eyebrow: t.pages.productRange, title: t.pages.equipmentHeroTitle, description: t.pages.equipmentHeroBody };
    case "gallery":
      return { eyebrow: t.nav.gallery, title: t.pages.galleryHeroTitle, description: t.pages.galleryHeroBody };
    case "services":
      return { eyebrow: "Terra Ferro Tech", title: t.pages.servicesHeroTitle, description: t.pages.servicesHeroBody };
    case "contact":
      return { eyebrow: "Terra Ferro Tech", title: t.pages.contactHeroTitle, description: t.pages.contactHeroBody };
  }
}

export function aboutUiDefaults(locale: Locale) {
  const t = getDictionary(locale);
  return {
    introTitle: t.pages.whatWeOffer,
    introBody: t.about.body,
    ctaTitle: t.nav.contact,
    ctaLabel: t.home.contactUs,
  };
}

export function aboutFeatureDefault(locale: Locale, index: number) {
  const t = getDictionary(locale);
  const rows = [
    { title: t.about.value1Title, body: t.about.value1Body },
    { title: t.about.value2Title, body: t.about.value2Body },
    { title: t.about.value3Title, body: t.about.value3Body },
  ];
  return rows[index] ?? { title: "", body: "" };
}

export function servicesUiDefaults(locale: Locale) {
  return { ctaLabel: getDictionary(locale).home.contactUs };
}

export function serviceItemDefault(locale: Locale, index: number) {
  return servicesList(locale)[index] ?? { title: "", body: "" };
}

export function contactUiDefaults(locale: Locale) {
  const t = getDictionary(locale);
  return {
    formTitle: t.pages.formTitle,
    submitLabel: t.pages.send,
    nameLabel: t.quoteForm.name,
    phoneLabel: t.quoteForm.phone,
    emailLabel: t.quoteForm.email,
    subjectLabel: t.pages.subject,
    messageLabel: t.quoteForm.message,
  };
}

export function homeSectionFieldDefault(type: HomeSectionType, field: "title" | "eyebrow" | "body" | "ctaLabel", locale: Locale) {
  const t = getDictionary(locale);
  const table: Partial<Record<HomeSectionType, Record<"title" | "eyebrow" | "body" | "ctaLabel", string>>> = {
    "model-finder": {
      title: t.home.findModel,
      eyebrow: t.home.findModelEyebrow,
      body: t.home.findModelBody,
      ctaLabel: t.home.exploreTractors,
    },
    "featured-tractors": {
      title: t.home.featuredTitle,
      eyebrow: t.home.featuredEyebrow,
      body: t.home.featuredTractorsBody,
      ctaLabel: t.home.viewAllTractors,
    },
    "product-categories": {
      title: t.home.equipmentHeadline,
      eyebrow: t.nav.equipment,
      body: t.home.equipmentBody,
      ctaLabel: t.home.viewEquipment,
    },
    "services-list": {
      title: t.home.servicesHeadline,
      eyebrow: t.nav.services,
      body: "",
      ctaLabel: "",
    },
    "about-split": {
      title: t.about.headline,
      eyebrow: "Terra Ferro Tech",
      body: t.about.body,
      ctaLabel: t.home.aboutCta,
    },
    "cta-banner": {
      title: t.home.ctaNeedMachine,
      eyebrow: "",
      body: t.home.ctaTalk,
      ctaLabel: t.nav.quote,
    },
    "gallery-preview": {
      title: t.home.galleryHeadline,
      eyebrow: t.home.galleryEyebrow,
      body: t.home.galleryBody,
      ctaLabel: t.home.galleryCta,
    },
  };
  return table[type]?.[field] ?? "";
}

export function homeSlideDefaults(id: string, locale: Locale) {
  const t = getDictionary(locale);
  if (id === "slide_tractors" || id.includes("tractor")) {
    return {
      eyebrow: t.home.slidePowerEyebrow,
      title: t.home.slidePowerTitle,
      subtitle: t.home.slidePowerSubtitle,
      primaryButtonText: t.home.exploreTractors,
      secondaryButtonText: t.nav.quote,
    };
  }
  if (id === "slide_equipment" || id.includes("equip")) {
    return {
      eyebrow: t.home.slideEquipEyebrow,
      title: t.home.slideEquipTitle,
      subtitle: t.home.slideEquipSubtitle,
      primaryButtonText: t.home.viewEquipment,
      secondaryButtonText: t.nav.quote,
    };
  }
  if (id === "slide_service" || id.includes("service")) {
    return {
      eyebrow: "Terra Ferro Tech",
      title: t.home.slideServiceTitle,
      subtitle: t.home.slideServiceSubtitle,
      primaryButtonText: t.home.contactUs,
      secondaryButtonText: t.home.aboutCta,
    };
  }
  return {
    eyebrow: "",
    title: t.home.heroTitle,
    subtitle: t.home.heroSubtitle,
    primaryButtonText: t.home.exploreTractors,
    secondaryButtonText: t.nav.quote,
  };
}
