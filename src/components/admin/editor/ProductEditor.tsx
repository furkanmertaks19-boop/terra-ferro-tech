"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Category, ProductStatus } from "@prisma/client";
import { Tractor, GearSix } from "@phosphor-icons/react";
import { slugify } from "@/lib/format";
import { productHref } from "@/lib/product-path";
import { saveProduct, publishProduct, unpublishProduct, archiveProduct, type ProductSaveInput } from "@/lib/actions/products";
import { specsToGroups, suggestedSpecGroups, type ContentBlock, type SpecGroup } from "@/lib/admin-content";
import {
  EQUIPMENT_SUBCATEGORIES,
  TRACTOR_SUBCATEGORIES,
  defaultTemplateFor,
  resolveTemplateId,
  type ProductTemplateId,
} from "@/lib/templates";
import { resolveHeroImageMode, editorCinematicImageMode, type HeroImageMode } from "@/lib/hero-image-mode";
import { BADGE_TONES, TONE_LABELS, resolveBadgeTone, type BadgeTone } from "@/lib/badges";
import type { AdminProduct } from "@/lib/types";
import { useToast } from "../ui/Toast";
import LocaleTabs, { missingHint } from "../ui/LocaleTabs";
import { parseI18nBag, type Locale } from "@/lib/i18n/config";
import { localeHasCopy } from "@/lib/i18n/config";
import { str } from "@/lib/i18n/content";
import RichTextEditor from "./RichTextEditor";
import MediaGallery from "./MediaGallery";
import SpecBuilder from "./SpecBuilder";
import ContentBlockBuilder from "./ContentBlockBuilder";
import NewProductStart from "./NewProductStart";
import TechnicalPdfField from "./TechnicalPdfField";

const SECTIONS = [
  { id: "basics", n: "01", label: "Ürün Bilgileri" },
  { id: "media", n: "02", label: "Ürün Galerisi" },
  { id: "specs", n: "03", label: "Teknik Özellikler" },
  { id: "publish", n: "04", label: "Görünürlük ve Etiketler" },
] as const;

export type RelatedOption = { id: string; name: string; slug: string; category: Category };

type State = {
  id: string | null;
  category: Category;
  template: ProductTemplateId;
  status: ProductStatus;
  series: string;
  subcategory: string;
  name: string;
  fullTitle: string;
  slug: string;
  slugTouched: boolean;
  stage: string;
  horsePower: string;
  hasCabin: boolean;
  featured: boolean;
  isCampaign: boolean;
  isNew: boolean;
  customBadge: string;
  customBadgeTone: BadgeTone;
  shortDescription: string;
  description: string;
  coverImage: string | null;
  images: string[];
  imageAlts: Record<string, string>;
  specGroups: SpecGroup[];
  contentBlocks: ContentBlock[];
  seoTitle: string;
  seoDescription: string;
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  technicalPdfName: string | null;
  technicalPdfSize: number | null;
  showTechnicalPdf: boolean;
  heroImageMode: HeroImageMode;
  hasUnpublishedChanges: boolean;
  referenceUrl: string;
  i18n: Record<string, Record<string, unknown>>;
};

function fromProduct(initial?: AdminProduct, presetCategory?: Category): State {
  const category = initial?.category ?? presetCategory ?? Category.TRACTOR;
  return {
    id: initial?.id ?? null,
    category,
    template: resolveTemplateId(initial?.template ?? defaultTemplateFor(category), category),
    status: initial?.status ?? ProductStatus.DRAFT,
    series: initial?.series ?? "",
    subcategory: initial?.subcategory ?? "",
    name: initial?.name ?? "",
    fullTitle: initial?.fullTitle ?? "",
    slug: initial?.slug ?? "",
    slugTouched: Boolean(initial),
    stage: initial?.stage ?? "",
    horsePower: initial?.horsePower != null ? String(initial.horsePower) : "",
    hasCabin: initial?.hasCabin ?? false,
    featured: initial?.featured ?? false,
    isCampaign: initial?.isCampaign ?? false,
    isNew: initial?.isNew ?? false,
    customBadge: initial?.customBadge ?? "",
    customBadgeTone: resolveBadgeTone(initial?.customBadgeTone),
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? null,
    images: initial?.images ?? [],
    imageAlts: initial?.imageAlts ?? {},
    specGroups: specsToGroups(initial?.specs ?? {}, initial?.specGroups).map((g) => g),
    contentBlocks: initial?.contentBlocks ?? [],
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    technicalPdfUrl: initial?.technicalPdfUrl ?? null,
    technicalPdfPublicId: initial?.technicalPdfPublicId ?? null,
    technicalPdfName: initial?.technicalPdfName ?? null,
    technicalPdfSize: initial?.technicalPdfSize ?? null,
    showTechnicalPdf: initial?.showTechnicalPdf ?? Boolean(initial?.technicalPdfUrl),
    heroImageMode: resolveHeroImageMode(initial?.heroImageMode),
    hasUnpublishedChanges: initial?.hasUnpublishedChanges ?? false,
    referenceUrl: initial?.referenceUrl ?? "",
    i18n: (initial as { i18n?: Record<string, Record<string, unknown>> } | undefined)?.i18n ?? {},
  };
}

export default function ProductEditor({
  initial,
  related: _related,
  presetCategory,
  subcategoriesByKind,
  liveSlug,
}: {
  initial?: AdminProduct;
  related: RelatedOption[];
  presetCategory?: Category;
  subcategoriesByKind?: { TRACTOR: string[]; EQUIPMENT: string[] };
  liveSlug?: string;
}) {
  void _related;
  const router = useRouter();
  const { push } = useToast();
  const [state, setState] = useState<State>(() => {
    const next = fromProduct(initial, presetCategory);
    if (!initial) next.specGroups = suggestedSpecGroups(next.category);
    return next;
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(initial ? new Date(initial.updatedAt) : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(SECTIONS.map((s) => [s.id, true])));
  const [publicSlug, setPublicSlug] = useState(liveSlug ?? initial?.slug ?? "");

  const patch = useCallback((partial: Partial<State>) => {
    setState((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  function setName(name: string) {
    const next: Partial<State> = { name };
    if (!state.slugTouched) next.slug = slugify(name);
    if (!state.fullTitle || state.fullTitle === state.name) next.fullTitle = name;
    patch(next);
  }

  function setCategory(category: Category) {
    patch({
      category,
      template: defaultTemplateFor(category),
      specGroups: state.id ? state.specGroups : suggestedSpecGroups(category),
    });
  }

  const payload = useCallback((current: State): ProductSaveInput => {
    const s = current;
    return {
      id: s.id,
      category: s.category,
      template: s.template,
      series: s.series,
      subcategory: s.subcategory || null,
      name: s.name.trim(),
      fullTitle: (s.fullTitle || s.name).trim(),
      slug: s.slug.trim() || slugify(s.name),
      stage: s.stage || null,
      horsePower: s.horsePower ? Number(s.horsePower) : null,
      hasCabin: s.hasCabin,
      featured: s.featured,
      isCampaign: s.isCampaign,
      isNew: s.isNew,
      customBadge: s.customBadge.trim() || null,
      customBadgeTone: s.customBadge.trim() ? s.customBadgeTone : null,
      shortDescription: s.shortDescription || null,
      description: s.description || null,
      coverImage: s.coverImage,
      images: s.images,
      imageAlts: s.imageAlts,
      specGroups: s.specGroups,
      contentBlocks: s.contentBlocks,
      seoTitle: s.seoTitle || null,
      seoDescription: s.seoDescription || null,
      technicalPdfUrl: s.technicalPdfUrl,
      technicalPdfPublicId: s.technicalPdfPublicId,
      technicalPdfName: s.technicalPdfName,
      technicalPdfSize: s.technicalPdfSize,
      showTechnicalPdf: s.showTechnicalPdf,
      heroImageMode: s.heroImageMode,
      referenceUrl: s.referenceUrl || null,
      i18n: s.i18n ?? {},
    };
  }, []);

  const validate = useCallback((data: ProductSaveInput) => {
    const next: Record<string, string> = {};
    if (!data.name) next.name = "Ürün adı zorunludur.";
    if (!data.fullTitle) next.fullTitle = "Tam başlık zorunludur.";
    if (!data.slug) next.slug = "Slug zorunludur.";
    if (!data.series) next.series = "Seri zorunludur.";
    const tips: string[] = [];
    if (!data.coverImage && data.images.length === 0) tips.push("Kapak görseli eklemeniz önerilir.");
    setErrors(next);
    setWarnings(tips);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      (document.querySelector(`#field-${first} input, #field-${first} textarea`) as HTMLElement | null)?.focus();
    }
    return Object.keys(next).length === 0;
  }, []);

  const persist = useCallback(
    async (mode: "manual" | "auto") => {
      const data = payload(state);
      if (mode !== "auto" && !validate(data)) return false;
      if (mode === "auto" && (!data.name || !data.series)) return false;
      setSaving(true);
      const result = await saveProduct(data);
      setSaving(false);
      if (!result.ok) {
        if (result.field) setErrors({ [result.field]: result.error });
        push(result.error, "error");
        return false;
      }
      const wasNew = !state.id;
      setState((prev) => ({
        ...prev,
        id: result.id,
        slug: wasNew ? result.slug : prev.slug,
        status: result.status,
        hasUnpublishedChanges: result.hasUnpublishedChanges,
      }));
      if (wasNew) router.replace(`/admin/products/${result.id}`);
      setDirty(false);
      setSavedAt(new Date());
      if (mode === "manual") push("Değişiklikler kaydedildi.");
      return true;
    },
    [payload, validate, push, router, state]
  );

  const publish = useCallback(async () => {
    const data = payload(state);
    if (!validate(data)) return false;
    setPublishing(true);
    const result = await publishProduct(data);
    setPublishing(false);
    if (!result.ok) {
      if (result.field) setErrors({ [result.field]: result.error });
      push(result.error, "error");
      return false;
    }
    const wasNew = !state.id;
    setState((prev) => ({
      ...prev,
      id: result.id,
      slug: result.slug,
      status: ProductStatus.PUBLISHED,
      hasUnpublishedChanges: false,
    }));
    setPublicSlug(result.slug);
    if (wasNew) router.replace(`/admin/products/${result.id}`);
    setDirty(false);
    setSavedAt(new Date());
    push("Ürün yayınlandı.");
    return true;
  }, [payload, validate, push, router, state]);

  const unpublish = useCallback(async () => {
    if (!state.id) return;
    setPublishing(true);
    const result = await unpublishProduct(state.id);
    setPublishing(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setState((prev) => ({ ...prev, status: ProductStatus.DRAFT, hasUnpublishedChanges: false }));
    push("Ürün yayından kaldırıldı.");
  }, [push, state.id]);

  useEffect(() => {
    if (!dirty || !state.id) return;
    const t = window.setTimeout(() => void persist("auto"), 2800);
    return () => window.clearTimeout(t);
  }, [dirty, state, persist]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void persist("manual");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [persist]);

  const [moreCopy, setMoreCopy] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [quick, setQuick] = useState(!initial);
  const [editLocale, setEditLocale] = useState<Locale>("sq");

  const busy = saving || publishing;
  const publicHref = (state.status === ProductStatus.PUBLISHED ? publicSlug || state.slug : state.slug)
    ? productHref({ category: state.category, slug: state.status === ProductStatus.PUBLISHED ? publicSlug || state.slug : state.slug })
    : null;
  const previewHref = state.id ? `/admin/preview/product/${state.id}` : null;
  const subcats = (subcategoriesByKind?.[state.category] ?? (state.category === Category.TRACTOR ? TRACTOR_SUBCATEGORIES : EQUIPMENT_SUBCATEGORIES)).filter(Boolean);
  const clock = savedAt ? savedAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : null;

  const saveLabel = useMemo(() => {
    if (publishing) return "Yayınlanıyor…";
    if (saving) return "Kaydediliyor…";
    if (dirty) return "Kaydedilmemiş değişiklikler";
    if (state.status === ProductStatus.PUBLISHED && state.hasUnpublishedChanges) return "● Yayında · Yayınlanmamış değişiklik var";
    if (state.status === ProductStatus.PUBLISHED) return "● Yayında";
    if (state.status === ProductStatus.ARCHIVED) return "● Arşiv";
    if (clock) return `● Taslak · kaydedildi ${clock}`;
    return "● Taslak";
  }, [saving, publishing, dirty, clock, state.status, state.hasUnpublishedChanges]);

  if (quick) {
    return (
      <div className="-mx-4 -mt-2 lg:-mx-6">
        <header className="admin-glass sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <Link href="/admin/products" className="text-sm text-[var(--admin-text-2)] hover:text-[var(--admin-text)]">
              ← Ürünler
            </Link>
            <p className="truncate font-display text-xl">Yeni Ürün</p>
            <p className="text-xs text-[var(--admin-muted)]">Hızlı başlangıç</p>
          </div>
          <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void persist("manual")}>
            {saving ? "Kaydediliyor…" : "Kaydet ve Devam Et"}
          </button>
        </header>
        <NewProductStart
          category={state.category}
          name={state.name}
          series={state.series}
          shortDescription={state.shortDescription}
          coverImage={state.coverImage}
          onCategory={setCategory}
          onName={setName}
          onSeries={(series) => patch({ series })}
          onShortDescription={(shortDescription) => patch({ shortDescription })}
          onCover={(url) => patch({ coverImage: url, images: state.images.includes(url) ? state.images : [url, ...state.images] })}
          onExpand={() => setQuick(false)}
          onSave={() => void persist("manual")}
          saving={saving}
        />
        {Object.values(errors).length > 0 && (
          <div className="mx-auto max-w-2xl px-4 pb-8 text-sm text-[var(--admin-danger)] lg:px-6">
            {Object.values(errors).map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-2 lg:-mx-6">
      <header className="admin-glass sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="min-w-0">
          <Link href="/admin/products" className="text-sm text-[var(--admin-text-2)] hover:text-[var(--admin-text)]">
            ← Ürünler
          </Link>
          <p className="truncate font-display text-xl">{state.name || "Yeni ürün"}</p>
          <p className="text-xs text-[var(--admin-muted)]">{saveLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.status === ProductStatus.PUBLISHED && publicHref ? (
            <a className="admin-btn admin-btn-ghost" href={publicHref} target="_blank" rel="noreferrer">
              Görüntüle
            </a>
          ) : previewHref ? (
            <a className="admin-btn admin-btn-ghost" href={previewHref} target="_blank" rel="noreferrer">
              Önizle
            </a>
          ) : (
            <button type="button" className="admin-btn admin-btn-ghost" disabled>
              Önizle
            </button>
          )}
          <button type="button" className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => void persist("manual")}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {state.status === ProductStatus.PUBLISHED ? (
            <>
              {state.hasUnpublishedChanges || dirty ? (
                <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void publish()}>
                  {publishing ? "Yayınlanıyor…" : "Yayınla"}
                </button>
              ) : null}
              <button type="button" className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => void unpublish()}>
                Yayından Kaldır
              </button>
            </>
          ) : (
            <button type="button" className="admin-btn admin-btn-primary" disabled={busy} onClick={() => void publish()}>
              {publishing ? "Yayınlanıyor…" : "Yayınla"}
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-4 px-4 py-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-4">
          <nav className="flex flex-wrap gap-1.5" aria-label="Bölümler">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#section-${s.id}`} className="admin-btn admin-btn-ghost min-h-8 px-2 text-xs">
                {s.n} {s.label}
              </a>
            ))}
          </nav>

          {Object.values(errors).length > 0 && (
            <div className="rounded-[10px] border border-[rgb(239_98_98/0.4)] bg-[rgb(239_98_98/0.12)] px-4 py-3 text-sm">
              {Object.values(errors).map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}
          {warnings.map((msg) => (
            <p key={msg} className="text-sm text-[var(--admin-warning)]">{msg}</p>
          ))}

          <Section id="basics" title="01 Ürün Bilgileri" open={open.basics} onToggle={() => setOpen((o) => ({ ...o, basics: !o.basics }))}>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setCategory(Category.TRACTOR)} className={`rounded-[10px] border p-4 text-left ${state.category === Category.TRACTOR ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}>
                <Tractor size={22} />
                <p className="mt-2 font-semibold">Traktör</p>
              </button>
              <button type="button" onClick={() => setCategory(Category.EQUIPMENT)} className={`rounded-[10px] border p-4 text-left ${state.category === Category.EQUIPMENT ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}>
                <GearSix size={22} />
                <p className="mt-2 font-semibold">Tarım Makinesi</p>
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <LocaleTabs
                value={editLocale}
                onChange={setEditLocale}
                missing={{
                  en: !localeHasCopy(state.i18n, "en", ["name", "fullTitle", "shortDescription"]),
                  tr: !localeHasCopy(state.i18n, "tr", ["name", "fullTitle", "shortDescription"]),
                }}
              />
              {missingHint(editLocale) ? <p className="text-xs text-amber-300">{missingHint(editLocale)}</p> : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field
                id="name"
                label="Ürün Adı"
                error={errors.name}
                value={editLocale === "sq" ? state.name : str(parseI18nBag(state.i18n)[editLocale]?.name)}
                onChange={(v) => {
                  if (editLocale === "sq") setName(v);
                  else {
                    const bag = parseI18nBag(state.i18n);
                    patch({ i18n: { ...bag, [editLocale]: { ...(bag[editLocale] ?? {}), name: v } } });
                  }
                }}
              />
              <Field
                id="series"
                label="Seri görünen adı"
                error={errors.series}
                value={editLocale === "sq" ? state.series : str(parseI18nBag(state.i18n)[editLocale]?.series)}
                onChange={(v) => {
                  if (editLocale === "sq") patch({ series: v });
                  else {
                    const bag = parseI18nBag(state.i18n);
                    patch({ i18n: { ...bag, [editLocale]: { ...(bag[editLocale] ?? {}), series: v } } });
                  }
                }}
              />
              <div className="sm:col-span-2">
                <p className="admin-label">Alt Kategori</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subcats.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-[8px] border px-3 py-2 text-sm ${state.subcategory === item ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}
                      onClick={() => patch({ subcategory: state.subcategory === item ? "" : item })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {state.category === Category.TRACTOR && (
                <>
                  <Field id="horsePower" label="HP" value={state.horsePower} onChange={(v) => patch({ horsePower: v })} />
                  <Field id="stage" label="Stage" value={state.stage} onChange={(v) => patch({ stage: v })} />
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" checked={state.hasCabin} onChange={(e) => patch({ hasCabin: e.target.checked })} />
                    Kabin / Cabin (ROPS kapalı)
                  </label>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="shortDescription">Kısa Açıklama</label>
                <textarea id="shortDescription" className="admin-textarea min-h-20" value={state.shortDescription} onChange={(e) => patch({ shortDescription: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Uzun Açıklama</label>
                <RichTextEditor value={state.description} onChange={(html) => patch({ description: html })} />
              </div>
            </div>
            <button type="button" className="mt-4 text-sm text-[var(--admin-accent-2)]" onClick={() => setMoreCopy((v) => !v)}>
              {moreCopy ? "Daha fazla bilgiyi gizle" : "+ Daha fazla bilgi"}
            </button>
            {moreCopy && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field id="fullTitle" label="Tam Başlık" error={errors.fullTitle} value={state.fullTitle} onChange={(v) => patch({ fullTitle: v })} />
                <Field id="slug" label="Slug" error={errors.slug} value={state.slug} onChange={(v) => patch({ slug: v, slugTouched: true })} mono />
                <div className="sm:col-span-2">
                  <p className="admin-label">Öne Çıkan Bilgiler</p>
                  <ContentBlockBuilder blocks={state.contentBlocks} onChange={(contentBlocks) => patch({ contentBlocks })} />
                </div>
              </div>
            )}
          </Section>

          <Section id="media" title="02 Ürün Galerisi" open={open.media} onToggle={() => setOpen((o) => ({ ...o, media: !o.media }))}>
            <MediaGallery
              images={state.images}
              cover={state.coverImage}
              alts={state.imageAlts}
              onChange={(next) => patch({ images: next.images, coverImage: next.cover, imageAlts: next.alts })}
            />
            <div className="mt-5">
              <p className="admin-label">Görsel yerleşimi</p>
              <p className="mb-2 text-xs text-[var(--admin-muted)]">
                Beyaz fonlu katalog görselleri için ürünü sahneye sığdırın. Ortam fotoğrafları için kareyi doldurun.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {([
                  ["CONTAIN", "Ürünü sahneye sığdır"],
                  ["COVER", "Fotoğrafı kareye yay"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`rounded-[8px] border px-3 py-2 text-left text-sm ${editorCinematicImageMode(state.heroImageMode) === value ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}
                    onClick={() => patch({ heroImageMode: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section id="specs" title="03 Teknik Özellikler" open={open.specs} onToggle={() => setOpen((o) => ({ ...o, specs: !o.specs }))}>
            <div className="mb-5 rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
              <p className="admin-label">Sayfa Tasarımı</p>
              <p className="mt-1 font-medium">Standart Ürün Sayfası</p>
              <p className="mt-1 text-sm text-[var(--admin-text-2)]">
                Tüm ürünler aynı kurumsal detay sayfasını kullanır. Kategori farkı başlık, açıklama, teknik bilgiler ve görsellerle yönetilir.
              </p>
            </div>
            <p className="mb-3 text-sm text-[var(--admin-text-2)]">
              {state.category === Category.TRACTOR
                ? "Motor, şanzıman, hidrolik ve kabin gruplarını düzenleyin. Boş değerler sitede gösterilmez."
                : "Çalışma genişliği, kapasite, bağlantı tipi ve gerekli HP alanlarını düzenleyin."}
            </p>
            <button
              type="button"
              className="admin-btn admin-btn-ghost mb-3 min-h-8"
              onClick={() => patch({ specGroups: [...state.specGroups, ...suggestedSpecGroups(state.category)] })}
            >
              Önerilen grupları ekle
            </button>
            <SpecBuilder groups={state.specGroups} onChange={(specGroups) => patch({ specGroups })} />
            <TechnicalPdfField
              value={{
                url: state.technicalPdfUrl,
                publicId: state.technicalPdfPublicId,
                name: state.technicalPdfName,
                size: state.technicalPdfSize,
                show: state.showTechnicalPdf,
              }}
              onChange={(next) =>
                patch({
                  technicalPdfUrl: next.url,
                  technicalPdfPublicId: next.publicId,
                  technicalPdfName: next.name,
                  technicalPdfSize: next.size,
                  showTechnicalPdf: next.show,
                })
              }
            />
          </Section>

          <Section id="publish" title="04 Görünürlük ve Etiketler" open={open.publish ?? true} onToggle={() => setOpen((o) => ({ ...o, publish: !o.publish }))}>
            <p className="admin-label">Ürün Etiketleri</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.featured} onChange={(e) => patch({ featured: e.target.checked })} />
                Ana sayfada öne çıkar
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.isNew} onChange={(e) => patch({ isNew: e.target.checked })} />
                Yeni
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.isCampaign} onChange={(e) => patch({ isCampaign: e.target.checked })} />
                Fırsat etiketi göster
              </label>
            </div>
            <p className="mt-2 text-xs text-[var(--admin-muted)]">
              Fırsat etiketi açıksa public sitede OFERTË görünür. Kërko Ofertë butonu etiketle aynı şey değildir.
            </p>
            {state.customBadge.trim() ? (
              <div className="mt-4 rounded-[10px] border border-[var(--admin-border)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Özel etiket</p>
                  <button type="button" className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-text)]" onClick={() => patch({ customBadge: "" })}>
                    Kaldır
                  </button>
                </div>
                <label className="admin-label mt-3" htmlFor="customBadge">Etiket</label>
                <input
                  id="customBadge"
                  className="admin-input"
                  maxLength={28}
                  value={state.customBadge}
                  onChange={(e) => patch({ customBadge: e.target.value })}
                  placeholder="E VEÇANTË"
                />
                <p className="admin-label mt-3">Renk</p>
                <div className="grid grid-cols-4 gap-2">
                  {BADGE_TONES.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className={`rounded-[8px] border px-2 py-2 text-xs ${state.customBadgeTone === tone ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}
                      onClick={() => patch({ customBadgeTone: tone })}
                    >
                      {TONE_LABELS[tone]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="mt-4 text-sm text-[var(--admin-accent-2)]"
                onClick={() => patch({ customBadge: "E VEÇANTË", customBadgeTone: "red" })}
              >
                + Özel Etiket Ekle
              </button>
            )}
            <p className="mt-3 text-xs text-[var(--admin-muted)]">
              Yayın durumu üst çubuktaki Yayınla / Yayından Kaldır ile yönetilir. Kaydet bu etiketleri kaydeder, ürünü yayınlamaz.
            </p>
            <button type="button" className="mt-4 text-sm text-[var(--admin-accent-2)]" onClick={() => setSeoOpen((v) => !v)}>
              {seoOpen ? "Gelişmiş ayarları gizle" : "Gelişmiş Ayarlar"}
            </button>
            {seoOpen && (
              <div className="mt-3 grid gap-3">
                <Field id="seoTitle" label="SEO başlığı" value={state.seoTitle} onChange={(v) => patch({ seoTitle: v })} />
                <div>
                  <label className="admin-label" htmlFor="seoDescription">SEO açıklaması</label>
                  <textarea id="seoDescription" className="admin-textarea min-h-20" value={state.seoDescription} onChange={(e) => patch({ seoDescription: e.target.value })} />
                </div>
                <div>
                  <p className="admin-label">Üretici Referansı</p>
                  {state.referenceUrl ? (
                    <a
                      href={state.referenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-sm text-[var(--admin-accent-2)] hover:underline"
                    >
                      ArmaTrac ürün sayfasını aç ↗
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-[var(--admin-muted)]">Kayıtlı üretici sayfası yok.</p>
                  )}
                  <input
                    className="admin-input mt-2"
                    placeholder="https://armatrac.com/tractor/..."
                    value={state.referenceUrl}
                    onChange={(e) => patch({ referenceUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">Yalnız admin. Public sitede gösterilmez.</p>
                </div>
                {state.category === Category.TRACTOR ? (
                  <div>
                    <p className="admin-label">Kaynak</p>
                    <p className="mt-1 text-sm text-[var(--admin-text-2)]">614 T2 Rops Stage IIIA.docx</p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">Yalnız admin. Public sitede gösterilmez.</p>
                  </div>
                ) : null}
              </div>
            )}
          </Section>
        </div>

        <aside className="hidden xl:block xl:sticky xl:top-36 xl:self-start">
            <div className="admin-glass rounded-[12px] p-4 text-sm">
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Durum</p>
              <p className="mt-2">
                {state.status === ProductStatus.PUBLISHED
                  ? state.hasUnpublishedChanges
                    ? "● Yayında · Yayınlanmamış değişiklik var"
                    : "● Yayında"
                  : state.status === ProductStatus.ARCHIVED
                    ? "● Arşiv"
                    : "● Taslak"}
              </p>
              {savedAt && (
                <>
                  <p className="mt-4 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Son güncelleme</p>
                  <p className="mt-2 text-[var(--admin-text-2)]">
                    {savedAt.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </>
              )}
              {state.technicalPdfUrl ? (
                <p className="mt-4 text-sm text-[var(--admin-text-2)]">
                  {state.showTechnicalPdf ? "● Teknik doküman hazır" : "Doküman yüklü · Web sitesinde gizli"}
                </p>
              ) : null}
              {state.id && state.status !== ProductStatus.ARCHIVED ? (
                <button
                  type="button"
                  className="mt-4 text-sm text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
                  disabled={busy}
                  onClick={() => {
                    void archiveProduct(state.id!).then((result) => {
                      if (!result.ok) {
                        push(result.error, "error");
                        return;
                      }
                      setState((prev) => ({ ...prev, status: ProductStatus.ARCHIVED }));
                      push("Ürün arşivlendi.");
                    });
                  }}
                >
                  Arşive al
                </button>
              ) : null}
            </div>
          </aside>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section id={`section-${id}`} className="admin-panel overflow-hidden">
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={onToggle} aria-expanded={open}>
        <h2 className="font-display text-lg">{title}</h2>
        <span className="text-[var(--admin-muted)]">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-[var(--admin-border)] px-4 py-4">{children}</div>}
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  mono,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  mono?: boolean;
}) {
  return (
    <div id={`field-${id}`}>
      <label className="admin-label" htmlFor={id}>{label}</label>
      <input id={id} className={`admin-input ${mono ? "font-mono" : ""}`} value={value} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="mt-1 text-xs text-[var(--admin-danger)]">{error}</p>}
    </div>
  );
}
