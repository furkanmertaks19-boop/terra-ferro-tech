"use client";

import { useState } from "react";
import Image from "next/image";
import { Category } from "@prisma/client";
import { Tractor, GearSix } from "@phosphor-icons/react";
import { uploadWithProgress } from "./upload";
import { useToast } from "../ui/Toast";

export default function NewProductStart({
  category,
  name,
  series,
  shortDescription,
  coverImage,
  onCategory,
  onName,
  onSeries,
  onShortDescription,
  onCover,
  onExpand,
  onSave,
  saving,
}: {
  category: Category;
  name: string;
  series: string;
  shortDescription: string;
  coverImage: string | null;
  onCategory: (category: Category) => void;
  onName: (value: string) => void;
  onSeries: (value: string) => void;
  onShortDescription: (value: string) => void;
  onCover: (url: string) => void;
  onExpand: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const { push } = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  async function upload(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    const url = await uploadWithProgress(file, setProgress, "products");
    setProgress(null);
    if (url) {
      onCover(url);
      push("Kapak görseli yüklendi");
    } else {
      push("Yükleme başarısız", "error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 lg:px-6">
      <section className="admin-panel p-4">
        <p className="admin-label">Ürün Türü</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onCategory(Category.TRACTOR)}
            className={`rounded-[10px] border p-4 text-left ${
              category === Category.TRACTOR
                ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]"
                : "border-[var(--admin-border)]"
            }`}
          >
            <Tractor size={22} />
            <p className="mt-2 font-semibold">Traktör</p>
          </button>
          <button
            type="button"
            onClick={() => onCategory(Category.EQUIPMENT)}
            className={`rounded-[10px] border p-4 text-left ${
              category === Category.EQUIPMENT
                ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]"
                : "border-[var(--admin-border)]"
            }`}
          >
            <GearSix size={22} />
            <p className="mt-2 font-semibold">Tarım Makinesi</p>
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="admin-label" htmlFor="quick-name">Ürün Adı</label>
            <input id="quick-name" className="admin-input" value={name} onChange={(e) => onName(e.target.value)} />
          </div>
          <div>
            <label className="admin-label" htmlFor="quick-series">Seri</label>
            <input id="quick-series" className="admin-input" value={series} onChange={(e) => onSeries(e.target.value)} />
          </div>
          <div>
            <label className="admin-label" htmlFor="quick-short">Kısa Açıklama</label>
            <textarea
              id="quick-short"
              className="admin-textarea min-h-20"
              value={shortDescription}
              onChange={(e) => onShortDescription(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="admin-panel p-4">
        <p className="admin-label">Kapak Görseli</p>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
          }}
          className="block cursor-pointer overflow-hidden rounded-[12px] border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface)]"
        >
          {coverImage ? (
            <span className="relative mx-auto block h-40 w-full max-w-[260px] bg-[var(--admin-bg-2)]">
              <Image src={coverImage} alt="" fill className="object-contain p-3" sizes="260px" />
            </span>
          ) : (
            <span className="flex min-h-36 flex-col items-center justify-center text-sm text-[var(--admin-text-2)]">
              <span>Dosyayı buraya sürükleyin</span>
              <span className="mt-1 text-[var(--admin-muted)]">veya Dosya Seç</span>
            </span>
          )}
          {progress != null && (
            <span className="block px-3 py-2 text-center text-sm text-[var(--admin-accent-2)]">Yükleniyor {progress}%</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="text-sm text-[var(--admin-accent-2)]" onClick={onExpand}>
          + Daha fazla bilgi
        </button>
        <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={onSave}>
          {saving ? "Kaydediliyor…" : "Kaydet ve Devam Et"}
        </button>
      </div>
    </div>
  );
}
