"use client";

import { useState } from "react";
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
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import { uid, type ContentBlock } from "@/lib/admin-content";
import { uploadWithProgress } from "./upload";
import { useToast } from "../ui/Toast";

const TYPES: { type: ContentBlock["type"]; label: string }[] = [
  { type: "text", label: "Metin Bloğu" },
  { type: "image", label: "Görsel" },
  { type: "image-text", label: "Görsel + Metin" },
  { type: "highlight", label: "Teknik Highlight" },
  { type: "features", label: "Feature Grid" },
  { type: "cta", label: "CTA" },
];

function emptyBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "text":
      return { id: uid(), type, html: "" };
    case "image":
      return { id: uid(), type, url: "", alt: "" };
    case "image-text":
      return { id: uid(), type, url: "", html: "" };
    case "highlight":
      return { id: uid(), type, title: "", body: "" };
    case "features":
      return { id: uid(), type, items: [{ id: uid(), title: "", body: "" }] };
    case "cta":
      return { id: uid(), type, title: "", body: "" };
  }
}

export default function ContentBlockBuilder({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <DndContext id="product-content-blocks" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onChange={(next) => onChange(blocks.map((b) => (b.id === block.id ? next : b)))}
              onRemove={() => onChange(blocks.filter((b) => b.id !== block.id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            className="admin-btn admin-btn-ghost min-h-9"
            onClick={() => onChange([...blocks, emptyBlock(item.type)])}
          >
            + {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockCard({
  block,
  onChange,
  onRemove,
}: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const label = TYPES.find((t) => t.type === block.type)?.label ?? block.type;
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="admin-panel p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" {...attributes} {...listeners} aria-label="Bloğu sürükle">
            <DotsSixVertical size={14} />
          </button>
          <p className="text-sm font-semibold">{label}</p>
        </div>
        <button type="button" className="admin-btn admin-btn-danger min-h-8" onClick={onRemove}>
          Sil
        </button>
      </div>
      <BlockFields block={block} onChange={onChange} />
    </div>
  );
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (b: ContentBlock) => void }) {
  const { push } = useToast();
  const [progress, setProgress] = useState<number | null>(null);

  async function pickImage(onUrl: (url: string) => void, file?: File) {
    if (!file) return;
    const url = await uploadWithProgress(file, setProgress);
    setProgress(null);
    if (!url) {
      push("Yükleme başarısız", "error");
      return;
    }
    push("Görsel yüklendi");
    onUrl(url);
  }

  if (block.type === "text") {
    return <textarea className="admin-textarea min-h-24" value={block.html} onChange={(e) => onChange({ ...block, html: e.target.value })} placeholder="Metin" />;
  }
  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <ImageField url={block.url} progress={progress} onFile={(f) => void pickImage((url) => onChange({ ...block, url }), f)} />
        <input className="admin-input" placeholder="Alt metin" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
      </div>
    );
  }
  if (block.type === "image-text") {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        <ImageField url={block.url} progress={progress} onFile={(f) => void pickImage((url) => onChange({ ...block, url }), f)} />
        <textarea className="admin-textarea min-h-24" value={block.html} onChange={(e) => onChange({ ...block, html: e.target.value })} placeholder="Metin" />
      </div>
    );
  }
  if (block.type === "highlight") {
    return (
      <div className="grid gap-2">
        <input className="admin-input" placeholder="Başlık" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
        <textarea className="admin-textarea min-h-20" placeholder="Açıklama" value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} />
      </div>
    );
  }
  if (block.type === "cta") {
    return (
      <div className="grid gap-2">
        <input className="admin-input" placeholder="CTA başlığı" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
        <textarea className="admin-textarea min-h-16" placeholder="CTA metni" value={block.body} onChange={(e) => onChange({ ...block, body: e.target.value })} />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <div key={item.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input className="admin-input" placeholder="Özellik" value={item.title} onChange={(e) => {
            const items = block.items.map((row, idx) => (idx === i ? { ...row, title: e.target.value } : row));
            onChange({ ...block, items });
          }} />
          <input className="admin-input" placeholder="Açıklama" value={item.body} onChange={(e) => {
            const items = block.items.map((row, idx) => (idx === i ? { ...row, body: e.target.value } : row));
            onChange({ ...block, items });
          }} />
          <div className="flex gap-1">
            <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" aria-label="Yukarı" disabled={i === 0} onClick={() => {
              const items = [...block.items];
              [items[i - 1], items[i]] = [items[i], items[i - 1]];
              onChange({ ...block, items });
            }}>↑</button>
            <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" aria-label="Aşağı" disabled={i === block.items.length - 1} onClick={() => {
              const items = [...block.items];
              [items[i + 1], items[i]] = [items[i], items[i + 1]];
              onChange({ ...block, items });
            }}>↓</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn-ghost min-h-8"
        onClick={() => onChange({ ...block, items: [...block.items, { id: uid(), title: "", body: "" }] })}
      >
        + Kart
      </button>
    </div>
  );
}

function ImageField({ url, progress, onFile }: { url: string; progress: number | null; onFile: (file: File) => void }) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-bg-3)]">
      {url ? (
        <span className="relative block h-28 w-full">
          <Image src={url} alt="" fill className="object-cover" sizes="240px" />
        </span>
      ) : (
        <span className="text-xs text-[var(--admin-muted)]">Görsel seç</span>
      )}
      {progress != null && <span className="py-1 text-xs text-[var(--admin-accent-2)]">Yükleniyor {progress}%</span>}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </label>
  );
}
