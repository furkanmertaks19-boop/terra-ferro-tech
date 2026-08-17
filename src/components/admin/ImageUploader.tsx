"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error || "Yükleme başarısız oldu");
        }
        uploaded.push(data.url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = images.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <p className="mb-2 text-xs text-black/50">İlk görsel kapak fotoğrafıdır. Sıralamak için sürükleyin.</p>
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex == null) return;
              move(dragIndex, index);
              setDragIndex(null);
            }}
            className="relative h-24 w-24 cursor-grab overflow-hidden border border-black/15 active:cursor-grabbing"
          >
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            {index === 0 && (
              <span className="absolute bottom-0 left-0 bg-black/75 px-1.5 py-0.5 text-[10px] text-white">Kapak</span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((img) => img !== url))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center border border-dashed border-black/25 text-xs text-black/50 hover:border-black/40">
          {uploading ? "Yükleniyor..." : "+ Görsel Ekle"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
