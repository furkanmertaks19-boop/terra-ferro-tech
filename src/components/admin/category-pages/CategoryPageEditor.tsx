"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { saveCategoryPage } from "@/lib/actions/category-pages";
import type { PublicCategoryPage } from "@/lib/category-page-types";
import SlideImageField from "@/components/admin/sliders/SlideImageField";
import { useToast } from "@/components/admin/ui/Toast";

const LABELS: Record<Category, string> = {
  TRACTOR: "Traktörler",
  EQUIPMENT: "Tarım Makineleri",
};

export default function CategoryPageEditor({
  initial,
}: {
  initial: PublicCategoryPage & { id: string | null };
}) {
  const router = useRouter();
  const { push } = useToast();
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [desktopImage, setDesktopImage] = useState(initial.desktopImage);
  const [mobileImage, setMobileImage] = useState(initial.mobileImage);
  const [overlayOpacity, setOverlayOpacity] = useState(initial.overlayOpacity);
  const [textPosition, setTextPosition] = useState(initial.textPosition);
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    const result = await saveCategoryPage({
      category: initial.category,
      eyebrow,
      title,
      subtitle,
      desktopImage,
      mobileImage,
      overlayOpacity,
      textPosition,
    });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push("Kategori sayfası kaydedildi.");
    router.refresh();
  }

  const overlay = overlayOpacity / 100;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/category-pages" className="text-sm text-[var(--admin-text-2)] hover:text-[var(--admin-text)]">
            ← Kategori Sayfaları
          </Link>
          <h1 className="font-display text-3xl font-semibold">{LABELS[initial.category]}</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Listeleme sayfasının üst alanını düzenleyin.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={() => void onSave()}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <section className="admin-panel p-4">
            <label className="admin-label" htmlFor="eyebrow">Üst küçük başlık</label>
            <input id="eyebrow" className="admin-input" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
            <label className="admin-label mt-3" htmlFor="title">Başlık</label>
            <input id="title" className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="admin-label mt-3" htmlFor="subtitle">Açıklama</label>
            <textarea id="subtitle" className="admin-textarea min-h-24" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </section>

          <section className="admin-panel space-y-4 p-4">
            <SlideImageField
              label="Header Görseli"
              required
              folder="category-pages"
              value={desktopImage || null}
              onChange={(url) => setDesktopImage(url ?? "")}
            />
            <SlideImageField
              label="Mobil Header Görseli"
              folder="category-pages"
              value={mobileImage}
              onChange={setMobileImage}
            />
          </section>

          <section className="admin-panel p-4">
            <label className="admin-label" htmlFor="overlay">Karartma ({overlayOpacity}%)</label>
            <input
              id="overlay"
              type="range"
              min={0}
              max={80}
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full"
            />
            <button type="button" className="mt-4 text-sm text-[var(--admin-accent-2)]" onClick={() => setAdvanced((v) => !v)}>
              {advanced ? "Gelişmiş ayarları gizle" : "Gelişmiş ayarlar"}
            </button>
            {advanced && (
              <div className="mt-3">
                <p className="admin-label">İçerik konumu</p>
                <div className="flex gap-2">
                  {(["left", "center"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      className={`admin-btn min-h-9 ${textPosition === pos ? "admin-btn-primary" : "admin-btn-ghost"}`}
                      onClick={() => setTextPosition(pos)}
                    >
                      {pos === "left" ? "Sol" : "Orta"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="admin-panel overflow-hidden xl:sticky xl:top-24 xl:self-start">
          <p className="px-4 pt-3 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Canlı önizleme</p>
          <div className="relative m-3 aspect-[16/9] overflow-hidden bg-ink text-warm">
            {desktopImage ? (
              <Image src={desktopImage} alt="" fill className="object-cover" sizes="360px" />
            ) : (
              <div className="absolute inset-0 bg-steel" />
            )}
            <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />
            <div className={`relative z-[1] flex h-full flex-col justify-center p-5 ${textPosition === "center" ? "items-center text-center" : "items-start"}`}>
              <p className="text-[10px] tracking-[0.18em] uppercase text-warm/70">{eyebrow || " "}</p>
              <p className="mt-1 font-display text-2xl font-semibold leading-none">{title || "Başlık"}</p>
              <p className="mt-2 line-clamp-2 text-xs text-warm/75">{subtitle}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
