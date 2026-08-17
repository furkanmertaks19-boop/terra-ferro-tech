"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SLIDE_POSITIONS, isSlidePosition, type AdminSlide, type PublicHeroSlide } from "@/lib/slide-types";
import { saveSlide } from "@/lib/actions/slides";
import { useToast } from "@/components/admin/ui/Toast";
import SlideImageField from "./SlideImageField";
import SlidePreview from "./SlidePreview";

type Draft = {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string | null;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  contentPosition: string;
  overlayOpacity: number;
  isActive: boolean;
  autoplayDuration: number;
  startsAt: string;
  endsAt: string;
};

function toDraft(slide?: AdminSlide | null): Draft {
  return {
    id: slide?.id,
    eyebrow: slide?.eyebrow ?? "",
    title: slide?.title ?? "",
    subtitle: slide?.subtitle ?? "",
    desktopImage: slide?.desktopImage ?? "",
    mobileImage: slide?.mobileImage ?? null,
    primaryButtonText: slide?.primaryButtonText ?? "",
    primaryButtonUrl: slide?.primaryButtonUrl ?? "",
    secondaryButtonText: slide?.secondaryButtonText ?? "",
    secondaryButtonUrl: slide?.secondaryButtonUrl ?? "",
    contentPosition: slide?.contentPosition ?? "left-center",
    overlayOpacity: slide?.overlayOpacity ?? 55,
    isActive: slide?.isActive ?? true,
    autoplayDuration: slide?.autoplayDuration ?? 7000,
    startsAt: slide?.startsAt ? toLocal(slide.startsAt) : "",
    endsAt: slide?.endsAt ? toLocal(slide.endsAt) : "",
  };
}

function toLocal(value: string | Date) {
  const iso = new Date(value).toISOString();
  return iso.slice(0, 16);
}

export default function SlideEditor({ initial }: { initial?: AdminSlide | null }) {
  const router = useRouter();
  const { push } = useToast();
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  const preview: PublicHeroSlide = useMemo(
    () => ({
      id: draft.id ?? "preview",
      eyebrow: draft.eyebrow,
      title: draft.title || "Başlık",
      subtitle: draft.subtitle,
      desktopImage: draft.desktopImage,
      mobileImage: draft.mobileImage,
      primaryButtonText: draft.primaryButtonText,
      primaryButtonUrl: draft.primaryButtonUrl || "#",
      secondaryButtonText: draft.secondaryButtonText,
      secondaryButtonUrl: draft.secondaryButtonUrl,
      contentPosition: isSlidePosition(draft.contentPosition) ? draft.contentPosition : "left-center",
      overlayOpacity: draft.overlayOpacity,
      autoplayDuration: draft.autoplayDuration,
    }),
    [draft]
  );

  async function persist() {
    setError(null);
    const result = await saveSlide({
      ...draft,
      id: draft.id ?? null,
      overlayOpacity: Number(draft.overlayOpacity),
      autoplayDuration: Number(draft.autoplayDuration),
      startsAt: draft.startsAt || null,
      endsAt: draft.endsAt || null,
    });
    if (!result.ok) {
      setError(result.error);
      push(result.error, "error");
      return;
    }
    push("Slide kaydedildi");
    if (!draft.id) router.replace(`/admin/sliders/${result.id}`);
    else router.refresh();
  }

  return (
    <div className="-mx-4 -mt-2 lg:-mx-6">
      <header className="admin-glass sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div>
          <Link href="/admin/sliders" className="text-sm text-[var(--admin-text-2)] hover:text-[var(--admin-text)]">
            ← Slider Yönetimi
          </Link>
          <p className="font-display text-xl">{draft.title || "Yeni slide"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="admin-btn admin-btn-ghost min-h-10 gap-2">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => patch({ isActive: e.target.checked })} />
            {draft.isActive ? "Aktif" : "Pasif"}
          </label>
          <button type="button" className="admin-btn admin-btn-primary" disabled={pending} onClick={() => start(() => void persist())}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </header>

      <div className="grid gap-5 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)] lg:px-6">
        <div className="space-y-4">
          {error ? <p className="rounded-[10px] border border-[rgb(239_98_98/0.4)] bg-[rgb(239_98_98/0.12)] px-4 py-3 text-sm">{error}</p> : null}

          <section className="admin-panel p-4">
            <h2 className="mb-3 font-display text-lg">İçerik</h2>
            <div className="space-y-3">
              <Field label="Küçük Üst Başlık" value={draft.eyebrow} onChange={(v) => patch({ eyebrow: v })} />
              <Field label="Ana Başlık" value={draft.title} onChange={(v) => patch({ title: v })} />
              <div>
                <label className="admin-label">Açıklama</label>
                <textarea className="admin-textarea min-h-28" value={draft.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
              </div>
            </div>
          </section>

          <section className="admin-panel p-4">
            <h2 className="mb-3 font-display text-lg">Butonlar</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ana buton yazısı" value={draft.primaryButtonText} onChange={(v) => patch({ primaryButtonText: v })} />
              <Field label="Ana buton bağlantısı" value={draft.primaryButtonUrl} onChange={(v) => patch({ primaryButtonUrl: v })} placeholder="/traktoret veya #quote" />
              <Field label="İkinci buton yazısı" value={draft.secondaryButtonText} onChange={(v) => patch({ secondaryButtonText: v })} />
              <Field label="İkinci buton bağlantısı" value={draft.secondaryButtonUrl} onChange={(v) => patch({ secondaryButtonUrl: v })} placeholder="/kontakt veya #quote" />
            </div>
            <p className="mt-2 text-xs text-[var(--admin-muted)]">Teklif modalı için bağlantı olarak #quote yazın. İkinci buton boşsa public sitede görünmez.</p>
          </section>

          <section className="admin-panel space-y-4 p-4">
            <h2 className="font-display text-lg">Görseller</h2>
            <SlideImageField label="Desktop görsel" required value={draft.desktopImage || null} onChange={(url) => patch({ desktopImage: url ?? "" })} />
            <SlideImageField label="Mobil görsel" value={draft.mobileImage} onChange={(url) => patch({ mobileImage: url })} />
          </section>

          <section className="admin-panel space-y-4 p-4">
            <h2 className="font-display text-lg">Görünüm</h2>
            <div>
              <label className="admin-label">İçerik pozisyonu</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SLIDE_POSITIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => patch({ contentPosition: item.id })}
                    className={`rounded-[8px] border px-3 py-2 text-sm ${
                      draft.contentPosition === item.id
                        ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]"
                        : "border-[var(--admin-border)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="admin-label">Görsel karartma {draft.overlayOpacity}%</label>
              <input
                type="range"
                min={0}
                max={85}
                value={draft.overlayOpacity}
                onChange={(e) => patch({ overlayOpacity: Number(e.target.value) })}
                className="w-full accent-[var(--admin-accent)]"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="admin-label">Gösterim süresi (ms)</label>
                <input
                  className="admin-input"
                  type="number"
                  min={3000}
                  max={20000}
                  step={500}
                  value={draft.autoplayDuration}
                  onChange={(e) => patch({ autoplayDuration: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Başlangıç</label>
                  <input className="admin-input" type="datetime-local" value={draft.startsAt} onChange={(e) => patch({ startsAt: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Bitiş</label>
                  <input className="admin-input" type="datetime-local" value={draft.endsAt} onChange={(e) => patch({ endsAt: e.target.value })} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
          <div className="flex gap-2">
            {(["desktop", "tablet", "mobile"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDevice(item)}
                className={`admin-btn min-h-9 px-3 text-xs ${device === item ? "admin-btn-primary" : "admin-btn-ghost"}`}
              >
                {item === "desktop" ? "Desktop" : item === "tablet" ? "Tablet" : "Mobile"}
              </button>
            ))}
          </div>
          <SlidePreview slide={preview} device={device} />
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input className="admin-input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
