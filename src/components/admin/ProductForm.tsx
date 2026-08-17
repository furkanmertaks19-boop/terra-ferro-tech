"use client";

import { useState } from "react";
import { Category, ProductStatus, Theme } from "@prisma/client";
import SpecsEditor from "./SpecsEditor";
import ImageUploader from "./ImageUploader";
import TemplatePicker from "./TemplatePicker";
import { slugify } from "@/lib/format";
import {
  DEFAULT_TEMPLATE,
  EQUIPMENT_SPEC_FIELDS,
  EQUIPMENT_SUBCATEGORIES,
  TRACTOR_SPEC_FIELDS,
  TRACTOR_SUBCATEGORIES,
  resolveTemplateId,
  type ProductTemplateId,
} from "@/lib/templates";
import type { ProductDTO } from "@/lib/types";
import { productHref } from "@/lib/product-path";

type SpecRow = { key: string; value: string };

function specsToRows(specs: Record<string, string>, reserved: string[]): SpecRow[] {
  const extra = Object.entries(specs)
    .filter(([key]) => !reserved.includes(key))
    .map(([key, value]) => ({ key, value }));
  return extra.length > 0 ? extra : [{ key: "", value: "" }];
}

export default function ProductForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: ProductDTO;
}) {
  const [category, setCategory] = useState<Category>(initial?.category ?? Category.TRACTOR);
  const [template, setTemplate] = useState<ProductTemplateId>(
    resolveTemplateId(initial?.template ?? DEFAULT_TEMPLATE)
  );
  const [fullTitle, setFullTitle] = useState(initial?.fullTitle ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [hasCabin, setHasCabin] = useState(initial?.hasCabin ?? false);
  const [isCampaign, setIsCampaign] = useState(initial?.isCampaign ?? false);
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [status, setStatus] = useState<ProductStatus>(initial?.status ?? ProductStatus.DRAFT);
  const reserved = category === Category.TRACTOR ? TRACTOR_SPEC_FIELDS.map((f) => f.key) : EQUIPMENT_SPEC_FIELDS.map((f) => f.key);
  const [specRows, setSpecRows] = useState<SpecRow[]>(specsToRows(initial?.specs ?? {}, reserved));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  const isTractor = category === Category.TRACTOR;
  const previewHref = initial ? productHref(initial) : null;

  function handleCategoryChange(next: Category) {
    setCategory(next);
    const recommended = next === Category.TRACTOR ? "tractor-cinematic" : "equipment-showcase";
    setTemplate(recommended);
  }

  function handleFullTitleChange(value: string) {
    setFullTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="theme" value={isTractor ? Theme.TRACTOR_THEME : Theme.EQUIPMENT_THEME} />
      <input type="hidden" name="coverImage" value={images[0] ?? ""} />

      <section className="border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-black/60">Ürün Türü</h2>
        <div className="flex gap-3">
          {(
            [
              [Category.TRACTOR, "Traktör"],
              [Category.EQUIPMENT, "Tarım Makinesi / Ataşman"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex-1 cursor-pointer border px-4 py-3 text-center text-sm font-medium ${
                category === value ? "border-brand-red bg-brand-red/5 text-brand-red" : "border-black/15 text-black/60"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={value}
                checked={category === value}
                onChange={() => handleCategoryChange(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-black/50">
          {isTractor
            ? "Traktör ürünlerinde HP, Stage, Kabin ve Seri bilgilerini ekleyebilirsiniz."
            : "Tarım makinelerinde çalışma genişliği, kapasite ve gerekli HP bilgilerini ekleyebilirsiniz."}
        </p>
      </section>

      <section className="border border-black/10 bg-white p-5">
        <TemplatePicker category={category} value={template} onChange={setTemplate} />
      </section>

      <section className="grid gap-4 border border-black/10 bg-white p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-bold uppercase tracking-wide text-black/60">Temel Bilgiler</h2>
        <Field label="Ürün adı / Model" name="name" defaultValue={initial?.name} required />
        <Field label="Tam başlık" name="fullTitle" value={fullTitle} onChange={handleFullTitleChange} required />
        <Field
          label="Slug (URL)"
          name="slug"
          value={slug}
          onChange={(v) => {
            setSlug(v);
            setSlugTouched(true);
          }}
          required
          mono
        />
        <Field label="Seri" name="series" defaultValue={initial?.series} required />
        <div>
          <label className="mb-1 block text-xs font-medium text-black/70">Alt kategori</label>
          <select
            name="subcategory"
            defaultValue={initial?.subcategory ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          >
            <option value="">Seçiniz</option>
            {(isTractor ? TRACTOR_SUBCATEGORIES : EQUIPMENT_SUBCATEGORIES).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-black/70">Kısa açıklama</label>
          <textarea
            name="shortDescription"
            rows={2}
            defaultValue={initial?.shortDescription ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-black/70">Uzun açıklama</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initial?.description ?? ""}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {isTractor ? (
        <section className="grid gap-4 border border-black/10 bg-white p-5 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-sm font-bold uppercase tracking-wide text-black/60">Traktör Bilgileri</h2>
          <Field label="Stage" name="stage" defaultValue={initial?.stage ?? ""} placeholder="Stage IIIA / Stage V" />
          <div>
            <label className="mb-1 block text-xs font-medium text-black/70">Motor Gücü (HP)</label>
            <input
              name="horsePower"
              type="number"
              step="0.1"
              defaultValue={initial?.horsePower ?? ""}
              className="w-full rounded border border-black/15 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2 text-sm">
            <input
              type="checkbox"
              name="hasCabin"
              checked={hasCabin}
              onChange={(e) => setHasCabin(e.target.checked)}
            />
            Kabinli (Cabin)
          </label>
          {TRACTOR_SPEC_FIELDS.map((field) => (
            <Field key={field.key} label={field.label} name={`spec__${field.key}`} defaultValue={initial?.specs[field.key] ?? ""} />
          ))}
        </section>
      ) : (
        <section className="grid gap-4 border border-black/10 bg-white p-5 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-sm font-bold uppercase tracking-wide text-black/60">Makine Bilgileri</h2>
          {EQUIPMENT_SPEC_FIELDS.map((field) => (
            <Field key={field.key} label={field.label} name={`spec__${field.key}`} defaultValue={initial?.specs[field.key] ?? ""} />
          ))}
        </section>
      )}

      <section className="grid gap-4 border border-black/10 bg-white p-5 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-bold uppercase tracking-wide text-black/60">Yayın</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Ana Sayfada Öne Çıkar
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isCampaign" checked={isCampaign} onChange={(e) => setIsCampaign(e.target.checked)} />
          Fırsat etiketi
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isNew" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
          Yeni etiketi
        </label>
        <div>
          <label className="mb-1 block text-xs font-medium text-black/70">Durum</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="w-full rounded border border-black/15 px-3 py-2 text-sm"
          >
            <option value={ProductStatus.DRAFT}>Taslak</option>
            <option value={ProductStatus.PUBLISHED}>Yayında</option>
            <option value={ProductStatus.ARCHIVED}>Arşiv</option>
          </select>
        </div>
      </section>

      <section className="border border-black/10 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black/60">Ek Teknik Özellikler</h2>
        <SpecsEditor rows={specRows} onChange={setSpecRows} />
        <input type="hidden" name="specsJson" value={JSON.stringify(specRows)} readOnly />
      </section>

      <section className="border border-black/10 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-black/60">Görseller</h2>
        <ImageUploader images={images} onChange={setImages} />
        <input type="hidden" name="imagesJson" value={JSON.stringify(images)} readOnly />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="bg-brand-black px-8 py-3 text-sm font-semibold text-white hover:bg-brand-anthracite"
        >
          Kaydet
        </button>
        {previewHref && (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-black/15 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Ürün Sayfasını Görüntüle
          </a>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  mono,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-black/70">{label}</label>
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        required={required}
        placeholder={placeholder}
        defaultValue={value == null ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`w-full rounded border border-black/15 px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
