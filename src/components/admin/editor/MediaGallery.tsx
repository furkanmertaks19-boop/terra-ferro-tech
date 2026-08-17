"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import { useToast } from "../ui/Toast";
import { uploadWithProgress } from "./upload";

export default function MediaGallery({
  images,
  cover,
  alts,
  onChange,
}: {
  images: string[];
  cover: string | null;
  alts: Record<string, string>;
  onChange: (next: { images: string[]; cover: string | null; alts: Record<string, string> }) => void;
}) {
  const { push } = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    const uploaded: string[] = [];
    for (const file of list) {
      const url = await uploadWithProgress(file, setProgress);
      if (url) {
        uploaded.push(url);
        push("Görsel yüklendi");
      } else {
        push("Yükleme başarısız", "error");
      }
    }
    setProgress(null);
    if (!uploaded.length) return;
    const nextImages = [...images, ...uploaded];
    onChange({ images: nextImages, cover: cover || nextImages[0], alts });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-label">Kapak Görseli</p>
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) void upload(e.dataTransfer.files);
          }}
          className="block cursor-pointer overflow-hidden rounded-[12px] border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface)] text-sm text-[var(--admin-text-2)]"
        >
          {cover ? (
            <span className="relative mx-auto block h-44 w-full max-w-[280px] bg-[var(--admin-bg-2)]">
              <Image src={cover} alt="" fill className="object-contain p-3" sizes="280px" />
            </span>
          ) : (
            <span className="flex min-h-36 flex-col items-center justify-center">
              <span>Dosyayı buraya sürükleyin</span>
              <span className="mt-1 text-[var(--admin-muted)]">veya Dosya Seç</span>
            </span>
          )}
          {progress != null && <span className="block px-3 py-2 text-center text-[var(--admin-accent-2)]">Yükleniyor {progress}%</span>}
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
        </label>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="admin-label mb-0">Ürün Galerisi</p>
          <label className="admin-btn admin-btn-ghost min-h-8 cursor-pointer px-3 text-xs">
            + Fotoğraf Ekle
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && void upload(e.target.files)} />
          </label>
        </div>
        <GalleryGrid images={images} cover={cover} alts={alts} onChange={onChange} />
      </div>
    </div>
  );
}

function GalleryGrid({
  images,
  cover,
  alts,
  onChange,
}: {
  images: string[];
  cover: string | null;
  alts: Record<string, string>;
  onChange: (next: { images: string[]; cover: string | null; alts: Record<string, string> }) => void;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.indexOf(String(active.id));
    const newIndex = images.indexOf(String(over.id));
    onChange({ images: arrayMove(images, oldIndex, newIndex), cover, alts });
  }

  const tiles = images.map((src) => (
    <ImageTile
      key={src}
      src={src}
      isCover={cover === src}
      alt={alts[src] ?? ""}
      sortable={mounted}
      onAlt={(alt) => onChange({ images, cover, alts: { ...alts, [src]: alt } })}
      onCover={() => onChange({ images, cover: src, alts })}
      onRemove={() =>
        onChange({
          images: images.filter((s) => s !== src),
          cover: cover === src ? images.find((s) => s !== src) ?? null : cover,
          alts,
        })
      }
    />
  ));

  if (!mounted) {
    return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles}</div>;
  }

  return (
    <DndContext id="product-media-gallery" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={images} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles}</div>
      </SortableContext>
    </DndContext>
  );
}

function ImageTile({
  src,
  isCover,
  alt,
  sortable,
  onAlt,
  onCover,
  onRemove,
}: {
  src: string;
  isCover: boolean;
  alt: string;
  sortable: boolean;
  onAlt: (v: string) => void;
  onCover: () => void;
  onRemove: () => void;
}) {
  if (sortable) {
    return <SortableImage src={src} isCover={isCover} alt={alt} onAlt={onAlt} onCover={onCover} onRemove={onRemove} />;
  }
  return (
    <div className="admin-panel overflow-hidden">
      <div className="relative aspect-[4/3] bg-[var(--admin-bg-3)]">
        <Image src={src} alt={alt || ""} fill className="object-cover" sizes="200px" />
        <span className="absolute left-1 top-1 grid h-8 w-8 place-items-center rounded-[6px] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          <DotsSixVertical size={14} />
        </span>
      </div>
      <div className="space-y-2 p-2">
        <input className="admin-input" value={alt} onChange={(e) => onAlt(e.target.value)} placeholder="Alt metin" />
        <div className="flex gap-1">
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 flex-1 text-xs" onClick={onCover}>
            {isCover ? "Kapak" : "Kapak yap"}
          </button>
          <button type="button" className="admin-btn admin-btn-danger min-h-8 px-2 text-xs" onClick={onRemove}>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableImage({
  src,
  isCover,
  alt,
  onAlt,
  onCover,
  onRemove,
}: {
  src: string;
  isCover: boolean;
  alt: string;
  onAlt: (v: string) => void;
  onCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: src });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="admin-panel overflow-hidden">
      <div className="relative aspect-[4/3] bg-[var(--admin-bg-3)]">
        <Image src={src} alt={alt || ""} fill className="object-cover" sizes="200px" />
        <button type="button" className="absolute left-1 top-1 admin-btn admin-btn-ghost min-h-8 px-2" {...attributes} {...listeners} aria-label="Sürükle">
          <DotsSixVertical size={14} />
        </button>
      </div>
      <div className="space-y-2 p-2">
        <input className="admin-input" value={alt} onChange={(e) => onAlt(e.target.value)} placeholder="Alt metin" />
        <div className="flex gap-1">
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 flex-1 text-xs" onClick={onCover}>
            {isCover ? "Kapak" : "Kapak yap"}
          </button>
          <button type="button" className="admin-btn admin-btn-danger min-h-8 px-2 text-xs" onClick={onRemove}>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
