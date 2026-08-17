"use client";

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
import SlideImageField from "@/components/admin/sliders/SlideImageField";
import { uid } from "@/lib/admin-content";
import type { HeroHeight, HeroType, PageHeroSlide, PageRevision, TextPosition } from "@/lib/page-cms";

const POSITIONS: { id: TextPosition; label: string }[] = [
  { id: "left", label: "Sol Orta" },
  { id: "left-bottom", label: "Sol Alt" },
  { id: "center", label: "Orta" },
];

const HEIGHTS: { id: HeroHeight; label: string }[] = [
  { id: "compact", label: "Kompakt" },
  { id: "standard", label: "Standart" },
  { id: "tall", label: "Büyük" },
];

export default function HeroFields({
  value,
  onChange,
}: {
  value: PageRevision;
  onChange: (next: PageRevision) => void;
}) {
  const hasMedia =
    value.heroType === "slider"
      ? value.slides.some((slide) => slide.isActive && slide.image)
      : Boolean(value.heroImage);

  function patch(partial: Partial<PageRevision>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="admin-label" htmlFor="page-eyebrow">
          Üst başlık
        </label>
        <input
          id="page-eyebrow"
          className="admin-input"
          value={value.eyebrow}
          onChange={(e) => patch({ eyebrow: e.target.value })}
        />
        <label className="admin-label mt-3" htmlFor="page-title">
          Ana başlık
        </label>
        <input
          id="page-title"
          className="admin-input"
          value={value.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
        <label className="admin-label mt-3" htmlFor="page-description">
          Açıklama
        </label>
        <textarea
          id="page-description"
          className="admin-textarea min-h-24"
          value={value.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>

      <div>
        <p className="admin-label">Hero tipi</p>
        <div className="flex flex-wrap gap-2">
          {([
            ["image", "Tek Görsel"],
            ["slider", "Slider"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-btn min-h-9 ${value.heroType === id ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => patch({ heroType: id as HeroType })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {value.heroType === "image" ? (
        <div className="space-y-4">
          <SlideImageField
            label="Desktop görsel"
            folder="pages"
            value={value.heroImage || null}
            onChange={(url) => patch({ heroImage: url ?? "" })}
          />
          <SlideImageField
            label="Mobil görsel"
            folder="pages"
            value={value.mobileImage}
            onChange={(url) => patch({ mobileImage: url })}
          />
        </div>
      ) : (
        <SlideList slides={value.slides} onChange={(slides) => patch({ slides })} />
      )}

      {!hasMedia ? (
        <p className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Hero görseli bulunmuyor. Sayfa koyu arka plan ve metinle gösterilir.
        </p>
      ) : null}

      <div>
        <label className="admin-label" htmlFor="page-overlay">
          Karartma ({value.overlayOpacity}%)
        </label>
        <input
          id="page-overlay"
          type="range"
          min={0}
          max={80}
          value={value.overlayOpacity}
          onChange={(e) => patch({ overlayOpacity: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <p className="admin-label">Metin konumu</p>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-btn min-h-9 ${value.textPosition === item.id ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => patch({ textPosition: item.id })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="admin-label">Yükseklik</p>
        <div className="flex flex-wrap gap-2">
          {HEIGHTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-btn min-h-9 ${value.heroHeight === item.id ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => patch({ heroHeight: item.id })}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideList({
  slides,
  onChange,
}: {
  slides: PageHeroSlide[];
  onChange: (slides: PageHeroSlide[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = slides.map((slide) => slide.id);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex((slide) => slide.id === active.id);
    const newIndex = slides.findIndex((slide) => slide.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(slides, oldIndex, newIndex).map((slide, index) => ({ ...slide, sortOrder: index })));
  }

  return (
    <div className="space-y-3">
      {slides.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-2)]">Henüz slide yok.</p>
      ) : (
        <DndContext id="page-hero-slides" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {slides.map((slide, index) => (
                <SlideRow
                  key={slide.id}
                  slide={slide}
                  index={index}
                  onChange={(next) => onChange(slides.map((item) => (item.id === slide.id ? next : item)))}
                  onRemove={() => onChange(slides.filter((item) => item.id !== slide.id).map((item, i) => ({ ...item, sortOrder: i })))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={() =>
          onChange([
            ...slides,
            { id: uid(), image: "", mobileImage: null, sortOrder: slides.length, isActive: true },
          ])
        }
      >
        Fotoğraf Ekle
      </button>
    </div>
  );
}

function SlideRow({
  slide,
  index,
  onChange,
  onRemove,
}: {
  slide: PageHeroSlide;
  index: number;
  onChange: (slide: PageHeroSlide) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-[12px] border border-[var(--admin-border)] p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" className="text-[var(--admin-muted)]" aria-label="Sırala" {...attributes} {...listeners}>
          <DotsSixVertical size={18} />
        </button>
        <p className="flex-1 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Slide {index + 1}</p>
        <button
          type="button"
          className={`admin-btn min-h-8 px-3 text-xs ${slide.isActive ? "admin-btn-ghost" : "admin-btn-primary"}`}
          onClick={() => onChange({ ...slide, isActive: !slide.isActive })}
        >
          {slide.isActive ? "Gizle" : "Göster"}
        </button>
        <button type="button" className="admin-btn admin-btn-danger min-h-8 px-3 text-xs" onClick={onRemove}>
          Kaldır
        </button>
      </div>
      <div className="space-y-3">
        <SlideImageField label="Görsel" folder="pages" value={slide.image || null} onChange={(url) => onChange({ ...slide, image: url ?? "" })} />
        <SlideImageField
          label="Mobil görsel"
          folder="pages"
          value={slide.mobileImage}
          onChange={(url) => onChange({ ...slide, mobileImage: url })}
        />
      </div>
    </div>
  );
}
