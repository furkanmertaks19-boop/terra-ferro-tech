"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadWithProgress } from "@/components/admin/editor/upload";
import { useToast } from "@/components/admin/ui/Toast";

export default function SlideImageField({
  label,
  required,
  value,
  onChange,
  folder = "slides",
}: {
  label: string;
  required?: boolean;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: "products" | "slides" | "category-pages" | "pages" | "gallery";
}) {
  const { push } = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  async function upload(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    const url = await uploadWithProgress(file, setProgress, folder);
    setProgress(null);
    if (url) {
      onChange(url);
      push("Görsel yüklendi");
    } else {
      push("Yükleme başarısız", "error");
    }
  }

  return (
    <div>
      <label className="admin-label">
        {label}
        {required ? " *" : ""}
      </label>
      {value ? (
        <div className="overflow-hidden rounded-[12px] border border-[var(--admin-border)]">
          <div className="relative aspect-[16/8] bg-[var(--admin-bg-2)]">
            <Image src={value} alt="" fill className="object-cover" sizes="640px" />
            {progress != null ? (
              <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm text-white">Yükleniyor {progress}%</div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 p-3">
            <label className="admin-btn admin-btn-ghost min-h-9 cursor-pointer px-3 text-xs">
              Değiştir
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
            </label>
            <a href={value} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost min-h-9 px-3 text-xs">
              Önizle
            </a>
            <button type="button" className="admin-btn admin-btn-danger min-h-9 px-3 text-xs" onClick={() => onChange(null)}>
              Sil
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
          }}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-4 text-center text-sm text-[var(--admin-text-2)]"
        >
          <span>Görseli buraya sürükleyin veya seçin</span>
          <span className="admin-btn admin-btn-ghost mt-3 min-h-9 px-4 text-xs">Dosya Seç</span>
          {progress != null && <span className="mt-2 text-[var(--admin-accent-2)]">Yükleniyor {progress}%</span>}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
        </label>
      )}
    </div>
  );
}
