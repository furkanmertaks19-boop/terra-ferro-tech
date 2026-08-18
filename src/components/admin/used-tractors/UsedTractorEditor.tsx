"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UsedTractorDrive, UsedTractorStatus } from "@prisma/client";
import MediaGallery from "@/components/admin/editor/MediaGallery";
import TechnicalPdfField from "@/components/admin/editor/TechnicalPdfField";
import { saveUsedTractor, type UsedTractorPayload } from "@/lib/actions/used-tractors";
import { slugify } from "@/lib/format";
import { useToast } from "@/components/admin/ui/Toast";

export type UsedTractorEditorData = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  year: number | null;
  hours: number | null;
  horsePower: number | null;
  fuelType: string | null;
  hasCabin: boolean;
  transmission: string | null;
  drive: UsedTractorDrive | null;
  location: string | null;
  shortDescription: string | null;
  description: string | null;
  specs: Record<string, string>;
  coverImage: string | null;
  images: string[];
  imageAlts: Record<string, string>;
  technicalPdfUrl: string | null;
  technicalPdfPublicId: string | null;
  technicalPdfName: string | null;
  technicalPdfSize: number | null;
  price: number | null;
  status: UsedTractorStatus;
  seoTitle: string | null;
  seoDescription: string | null;
};

type SpecRow = { key: string; value: string };

function specsToRows(specs: Record<string, string>): SpecRow[] {
  const rows = Object.entries(specs).map(([key, value]) => ({ key, value }));
  return rows.length ? rows : [{ key: "", value: "" }];
}

export default function UsedTractorEditor({ initial }: { initial?: UsedTractorEditorData }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [state, setState] = useState({
    brand: initial?.brand ?? "",
    model: initial?.model ?? "",
    slug: initial?.slug ?? "",
    year: initial?.year?.toString() ?? "",
    hours: initial?.hours?.toString() ?? "",
    horsePower: initial?.horsePower?.toString() ?? "",
    fuelType: initial?.fuelType ?? "",
    hasCabin: initial?.hasCabin ?? false,
    transmission: initial?.transmission ?? "",
    drive: initial?.drive ?? "",
    location: initial?.location ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    specs: specsToRows(initial?.specs ?? {}),
    coverImage: initial?.coverImage ?? null,
    images: initial?.images ?? [],
    imageAlts: initial?.imageAlts ?? {},
    technicalPdfUrl: initial?.technicalPdfUrl ?? null,
    technicalPdfPublicId: initial?.technicalPdfPublicId ?? null,
    technicalPdfName: initial?.technicalPdfName ?? null,
    technicalPdfSize: initial?.technicalPdfSize ?? null,
    price: initial?.price?.toString() ?? "",
    status: initial?.status ?? UsedTractorStatus.DRAFT,
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
  });

  function patch<K extends keyof typeof state>(key: K, value: (typeof state)[K]) {
    setState((current) => {
      const next = { ...current, [key]: value };
      if ((key === "brand" || key === "model" || key === "year") && !slugTouched) {
        next.slug = slugify([next.brand, next.model, next.year].filter(Boolean).join(" "));
      }
      return next;
    });
  }

  function payload(): UsedTractorPayload {
    return {
      brand: state.brand,
      model: state.model,
      slug: state.slug || slugify(`${state.brand} ${state.model}`),
      year: state.year ? Number(state.year) : null,
      hours: state.hours ? Number(state.hours) : null,
      horsePower: state.horsePower ? Number(state.horsePower) : null,
      fuelType: state.fuelType || null,
      hasCabin: state.hasCabin,
      transmission: state.transmission || null,
      drive: state.drive === UsedTractorDrive.FOUR_WD || state.drive === UsedTractorDrive.TWO_WD ? state.drive : null,
      location: state.location || null,
      shortDescription: state.shortDescription || null,
      description: state.description || null,
      specs: Object.fromEntries(state.specs.filter((row) => row.key.trim() && row.value.trim()).map((row) => [row.key, row.value])),
      coverImage: state.coverImage,
      images: state.images,
      imageAlts: state.imageAlts,
      technicalPdfUrl: state.technicalPdfUrl,
      technicalPdfPublicId: state.technicalPdfPublicId,
      technicalPdfName: state.technicalPdfName,
      technicalPdfSize: state.technicalPdfSize,
      price: state.price ? Number(state.price) : null,
      status: state.status,
      seoTitle: state.seoTitle || null,
      seoDescription: state.seoDescription || null,
    };
  }

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await saveUsedTractor(payload(), initial?.id);
          if (!result.ok) {
            push(result.error, "error");
            return;
          }
          push("Kaydedildi");
          if (!initial?.id) router.replace(`/admin/used-tractors/${result.id}`);
          else router.refresh();
        });
      }}
    >
      <div className="space-y-4">
        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">Kimlik</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Marka" value={state.brand} onChange={(value) => patch("brand", value)} required />
            <Field label="Model" value={state.model} onChange={(value) => patch("model", value)} required />
            <Field label="Model yılı" value={state.year} onChange={(value) => patch("year", value)} inputMode="numeric" />
            <Field label="Çalışma saati" value={state.hours} onChange={(value) => patch("hours", value)} inputMode="numeric" />
            <Field label="Motor gücü (HP)" value={state.horsePower} onChange={(value) => patch("horsePower", value)} inputMode="decimal" />
            <label className="block">
              <span className="admin-label">Yakıt</span>
              <select className="admin-select" value={state.fuelType} onChange={(event) => patch("fuelType", event.target.value)}>
                <option value="">Belirtilmedi</option>
                <option value="Naftë">Naftë</option>
                <option value="Benzinë">Benzinë</option>
                <option value="Tjetër">Tjetër</option>
              </select>
            </label>
            <label className="block">
              <span className="admin-label">Kabin / ROPS</span>
              <select className="admin-select" value={state.hasCabin ? "cabin" : "rops"} onChange={(event) => patch("hasCabin", event.target.value === "cabin")}>
                <option value="cabin">Kabin</option>
                <option value="rops">ROPS</option>
              </select>
            </label>
            <label className="block">
              <span className="admin-label">Çekiş</span>
              <select className="admin-select" value={state.drive} onChange={(event) => patch("drive", event.target.value)}>
                <option value="">Belirtilmedi</option>
                <option value={UsedTractorDrive.FOUR_WD}>4x4</option>
                <option value={UsedTractorDrive.TWO_WD}>4x2</option>
              </select>
            </label>
            <Field label="Vites / şanzıman" value={state.transmission} onChange={(value) => patch("transmission", value)} />
            <Field label="Konum" value={state.location} onChange={(value) => patch("location", value)} />
            <Field label="Fiyat (yalnızca admin, sitede görünmez)" value={state.price} onChange={(value) => patch("price", value)} inputMode="decimal" />
          </div>
          <Field
            label="Slug"
            value={state.slug}
            onChange={(value) => {
              setSlugTouched(true);
              patch("slug", value);
            }}
          />
        </section>

        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">Açıklama</h2>
          <label className="block">
            <span className="admin-label">Kısa açıklama</span>
            <textarea className="admin-textarea min-h-20" value={state.shortDescription} onChange={(event) => patch("shortDescription", event.target.value)} />
          </label>
          <label className="block">
            <span className="admin-label">Açıklama</span>
            <textarea className="admin-textarea min-h-36" value={state.description} onChange={(event) => patch("description", event.target.value)} />
          </label>
        </section>

        <section className="admin-panel space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Teknik bilgiler</h2>
            <button type="button" className="admin-btn admin-btn-ghost min-h-9" onClick={() => patch("specs", [...state.specs, { key: "", value: "" }])}>
              + Satır
            </button>
          </div>
          <div className="space-y-2">
            {state.specs.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input className="admin-input" placeholder="Özellik" value={row.key} onChange={(event) => patch("specs", state.specs.map((item, i) => (i === index ? { ...item, key: event.target.value } : item)))} />
                <input className="admin-input" placeholder="Değer" value={row.value} onChange={(event) => patch("specs", state.specs.map((item, i) => (i === index ? { ...item, value: event.target.value } : item)))} />
                <button type="button" className="admin-btn admin-btn-ghost min-h-10 px-2" onClick={() => patch("specs", state.specs.filter((_, i) => i !== index))} aria-label="Satırı sil">
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">Fotoğraflar</h2>
          <MediaGallery
            images={state.images}
            cover={state.coverImage}
            alts={state.imageAlts}
            onChange={(next) => {
              setState((current) => ({ ...current, images: next.images, coverImage: next.cover, imageAlts: next.alts }));
            }}
          />
        </section>

        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">Teknik PDF</h2>
          <TechnicalPdfField
            value={{
              url: state.technicalPdfUrl,
              publicId: state.technicalPdfPublicId,
              name: state.technicalPdfName,
              size: state.technicalPdfSize,
              show: Boolean(state.technicalPdfUrl),
            }}
            onChange={(next) => {
              setState((current) => ({
                ...current,
                technicalPdfUrl: next.url,
                technicalPdfPublicId: next.publicId,
                technicalPdfName: next.name,
                technicalPdfSize: next.size,
              }));
            }}
          />
        </section>

        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">SEO</h2>
          <Field label="SEO başlığı" value={state.seoTitle} onChange={(value) => patch("seoTitle", value)} />
          <label className="block">
            <span className="admin-label">SEO açıklaması</span>
            <textarea className="admin-textarea min-h-20" value={state.seoDescription} onChange={(event) => patch("seoDescription", event.target.value)} />
          </label>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <section className="admin-panel space-y-3 p-4">
          <h2 className="font-display text-lg">Durum</h2>
          <select className="admin-select" value={state.status} onChange={(event) => patch("status", event.target.value as UsedTractorStatus)}>
            <option value={UsedTractorStatus.DRAFT}>Taslak</option>
            <option value={UsedTractorStatus.FOR_SALE}>Satışta</option>
            <option value={UsedTractorStatus.RESERVED}>Rezerve</option>
            <option value={UsedTractorStatus.SOLD}>Satıldı</option>
            <option value={UsedTractorStatus.ARCHIVED}>Arşiv</option>
          </select>
          <p className="text-xs text-[var(--admin-muted)]">Satışta, rezerve ve satıldı kayıtları modül açıkken public sitede görünür.</p>
          <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </section>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "numeric" | "decimal";
}) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <input className="admin-input" value={value} required={required} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
