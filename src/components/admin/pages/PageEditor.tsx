"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroFields from "@/components/admin/pages/HeroFields";
import FeatureListEditor from "@/components/admin/pages/FeatureListEditor";
import PageLivePreview from "@/components/admin/pages/PageLivePreview";
import SlideImageField from "@/components/admin/sliders/SlideImageField";
import { useToast } from "@/components/admin/ui/Toast";
import { publishPage, savePage } from "@/lib/actions/pages";
import {
  pageDef,
  parseAboutConfig,
  parseContactConfig,
  parseGalleryConfig,
  parseServicesConfig,
  type PageKey,
  type PageRevision,
} from "@/lib/page-cms";

export default function PageEditor({
  pageKey,
  initial,
  hasUnpublishedChanges,
  canPublishPages,
}: {
  pageKey: PageKey;
  initial: PageRevision;
  hasUnpublishedChanges: boolean;
  canPublishPages: boolean;
}) {
  const def = pageDef(pageKey);
  const router = useRouter();
  const { push } = useToast();
  const [revision, setRevision] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [unpublished, setUnpublished] = useState(hasUnpublishedChanges);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [open, setOpen] = useState<string>("hero");

  function update(next: PageRevision) {
    setRevision(next);
    setDirty(true);
  }

  async function onSave() {
    setSaving(true);
    const result = await savePage({ pageKey, revision });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return false;
    }
    setDirty(false);
    setUnpublished(true);
    push("Taslak kaydedildi. Public sayfa değişmedi.");
    router.refresh();
    return true;
  }

  async function onPreview() {
    if (dirty) {
      const ok = await onSave();
      if (!ok) return;
    }
    window.open(`/admin/preview/page/${pageKey}`, "_blank", "noopener,noreferrer");
  }

  async function onPublish() {
    setPublishing(true);
    const result = await publishPage({ pageKey, revision });
    setPublishing(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setDirty(false);
    setUnpublished(false);
    push("Sayfa yayınlandı.");
    router.refresh();
  }

  const about = parseAboutConfig(revision.config);
  const services = parseServicesConfig(revision.config);
  const gallery = parseGalleryConfig(revision.config);
  const contact = parseContactConfig(revision.config);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/pages" className="text-sm text-[var(--admin-text-2)] hover:text-[var(--admin-text)]">
            ← Sayfalar
          </Link>
          <h1 className="font-display text-3xl font-semibold">{def.adminTitle}</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">
            {def.publicName} · {def.path} · {def.summary}
          </p>
          {unpublished ? (
            <p className="mt-2 text-sm text-amber-300">Yayınlanmamış değişiklik var. Kaydet public’i güncellemez.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => void onPreview()}>
            Önizle
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" disabled={saving} onClick={() => void onSave()}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {canPublishPages ? (
            <button type="button" className="admin-btn admin-btn-primary" disabled={publishing} onClick={() => void onPublish()}>
              {publishing ? "Yayınlanıyor…" : "Yayınla"}
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <Accordion id="hero" title="01 Hero" open={open} onToggle={setOpen}>
            <HeroFields value={revision} onChange={update} />
          </Accordion>

          {def.kind === "about" ? (
            <>
              <Accordion id="intro" title="02 Tanıtım" open={open} onToggle={setOpen}>
                <label className="admin-label">Başlık</label>
                <input
                  className="admin-input"
                  value={about.introTitle}
                  onChange={(e) => update({ ...revision, config: { ...about, introTitle: e.target.value } })}
                />
                <label className="admin-label mt-3">Metin</label>
                <textarea
                  className="admin-textarea min-h-32"
                  value={about.introBody}
                  onChange={(e) => update({ ...revision, config: { ...about, introBody: e.target.value } })}
                />
                <div className="mt-4">
                  <SlideImageField
                    label="Görsel"
                    folder="pages"
                    value={about.introImage}
                    onChange={(url) => update({ ...revision, config: { ...about, introImage: url } })}
                  />
                </div>
              </Accordion>
              <Accordion id="features" title="03 Hizmetler / Özellikler" open={open} onToggle={setOpen}>
                <FeatureListEditor
                  items={about.features}
                  addLabel="+ Yeni Madde"
                  onChange={(features) => update({ ...revision, config: { ...about, features } })}
                />
              </Accordion>
              <Accordion id="cta" title="04 CTA" open={open} onToggle={setOpen}>
                <label className="admin-label">Başlık</label>
                <input
                  className="admin-input"
                  value={about.ctaTitle}
                  onChange={(e) => update({ ...revision, config: { ...about, ctaTitle: e.target.value } })}
                />
                <label className="admin-label mt-3">Buton metni</label>
                <input
                  className="admin-input"
                  value={about.ctaLabel}
                  onChange={(e) => update({ ...revision, config: { ...about, ctaLabel: e.target.value } })}
                />
              </Accordion>
            </>
          ) : null}

          {def.kind === "services" ? (
            <>
              <Accordion id="services" title="02 Hizmetler" open={open} onToggle={setOpen}>
                <FeatureListEditor
                  items={services.items}
                  withImage
                  addLabel="+ Yeni Hizmet"
                  onChange={(items) => update({ ...revision, config: { ...services, items } })}
                />
              </Accordion>
              <Accordion id="cta" title="03 CTA" open={open} onToggle={setOpen}>
                <label className="admin-label">Buton metni</label>
                <input
                  className="admin-input"
                  value={services.ctaLabel}
                  onChange={(e) => update({ ...revision, config: { ...services, ctaLabel: e.target.value } })}
                />
              </Accordion>
            </>
          ) : null}

          {def.kind === "gallery" ? (
            <Accordion id="gallery" title="02 Galeri ayarları" open={open} onToggle={setOpen}>
              <p className="mb-4 text-sm text-[var(--admin-text-2)]">
                Fotoğraf ve videolar mevcut Galeri modülünden gelir. Burada yalnızca sayfa metinleri ve filtre görünürlüğü yönetilir.
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={gallery.showFilters}
                  onChange={(e) => update({ ...revision, config: { showFilters: e.target.checked } })}
                />
                Filtre alanını göster
              </label>
            </Accordion>
          ) : null}

          {def.kind === "contact" ? (
            <Accordion id="form" title="02 Form metinleri" open={open} onToggle={setOpen}>
              <p className="mb-4 text-sm text-[var(--admin-text-2)]">
                E-posta, telefon, adres ve harita buradan yönetilmez. Sistem → Firma Bilgileri kullanılır.
              </p>
              <label className="admin-label">Form başlığı</label>
              <input
                className="admin-input"
                value={contact.formTitle}
                onChange={(e) => update({ ...revision, config: { ...contact, formTitle: e.target.value } })}
              />
              <label className="admin-label mt-3">Gönder butonu</label>
              <input
                className="admin-input"
                value={contact.submitLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, submitLabel: e.target.value } })}
              />
              <label className="admin-label mt-3">Ad soyad</label>
              <input
                className="admin-input"
                value={contact.nameLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, nameLabel: e.target.value } })}
              />
              <label className="admin-label mt-3">Telefon</label>
              <input
                className="admin-input"
                value={contact.phoneLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, phoneLabel: e.target.value } })}
              />
              <label className="admin-label mt-3">E-posta</label>
              <input
                className="admin-input"
                value={contact.emailLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, emailLabel: e.target.value } })}
              />
              <label className="admin-label mt-3">Konu</label>
              <input
                className="admin-input"
                value={contact.subjectLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, subjectLabel: e.target.value } })}
              />
              <label className="admin-label mt-3">Mesaj</label>
              <input
                className="admin-input"
                value={contact.messageLabel}
                onChange={(e) => update({ ...revision, config: { ...contact, messageLabel: e.target.value } })}
              />
            </Accordion>
          ) : null}

          {def.kind === "hero" ? (
            <p className="rounded-[12px] border border-[var(--admin-border)] px-4 py-3 text-sm text-[var(--admin-text-2)]">
              Ürün listesi, filtreler ve kartlar mevcut ürün sisteminden gelir. Bu ekranda yalnızca hero düzenlenir.
            </p>
          ) : null}
        </div>

        <PageLivePreview pageKey={pageKey} revision={revision} />
      </div>
    </div>
  );
}

function Accordion({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: string;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const isOpen = open === id;
  return (
    <section className="admin-panel overflow-hidden">
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => onToggle(isOpen ? "" : id)}>
        <span className="text-xs font-semibold tracking-[0.16em] uppercase">{title}</span>
        <span className="text-[var(--admin-muted)]">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen ? <div className="border-t border-[var(--admin-border)] p-4">{children}</div> : null}
    </section>
  );
}
