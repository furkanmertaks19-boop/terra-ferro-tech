"use client";

import { useMemo, useState, useTransition, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
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
import { deleteSlide, reorderSlides, toggleSlideActive } from "@/lib/actions/slides";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import HeroSlideView from "@/components/home/HeroSlideView";
import { isSlidePosition, type AdminSlide, type PublicHeroSlide } from "@/lib/slide-types";

export default function SlidersWorkspace({ slides }: { slides: AdminSlide[] }) {
  const confirm = useConfirm();
  const { push } = useToast();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [items, setItems] = useState(slides);
  const [preview, setPreview] = useState<AdminSlide | null>(null);
  const [pending, start] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => items.map((s) => s.id), [items]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    start(async () => {
      await reorderSlides(next.map((s) => s.id));
      push("Sıra güncellendi");
    });
  }

  if (!items.length) {
    return (
      <div className="admin-panel grid min-h-72 place-items-center p-8 text-center">
        <div>
          <p className="font-display text-2xl">Henüz slider oluşturulmamış.</p>
          <Link href="/admin/sliders/new" className="admin-btn admin-btn-primary mt-5">
            İlk Slide&apos;ı Oluştur
          </Link>
        </div>
      </div>
    );
  }

  const cards = items.map((slide, index) => (
    <SlideCard
      key={slide.id}
      slide={slide}
      index={index}
      disabled={pending}
      sortable={mounted}
      onPreview={() => setPreview(slide)}
      onToggle={() =>
        start(async () => {
          await toggleSlideActive(slide.id, !slide.isActive);
          setItems((list) => list.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
          push(slide.isActive ? "Slide pasif" : "Slide aktif");
        })
      }
      onDelete={async () => {
        const ok = await confirm({
          title: "Bu slide silinsin mi?",
          body: "Bu işlem geri alınamaz.",
          confirmLabel: "Slide'ı Sil",
          danger: true,
        });
        if (!ok) return;
        start(async () => {
          await deleteSlide(slide.id);
          setItems((list) => list.filter((s) => s.id !== slide.id));
          push("Slide silindi");
        });
      }}
    />
  ));

  return (
    <>
      {mounted ? (
        <DndContext id="home-slides" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">{cards}</div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">{cards}</div>
      )}

      {preview ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={() => setPreview(null)} />
          <div className="admin-glass relative w-full max-w-5xl overflow-hidden rounded-[14px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg">{preview.title}</p>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPreview(null)}>
                Kapat
              </button>
            </div>
            <div className="aspect-[16/9] overflow-hidden rounded-[12px] bg-ink">
              <HeroSlideView slide={toPublic(preview)} compact />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function toPublic(slide: AdminSlide): PublicHeroSlide {
  return {
    id: slide.id,
    eyebrow: slide.eyebrow,
    title: slide.title,
    subtitle: slide.subtitle,
    desktopImage: slide.desktopImage,
    mobileImage: slide.mobileImage,
    primaryButtonText: slide.primaryButtonText,
    primaryButtonUrl: slide.primaryButtonUrl,
    secondaryButtonText: slide.secondaryButtonText,
    secondaryButtonUrl: slide.secondaryButtonUrl,
    contentPosition: isSlidePosition(slide.contentPosition) ? slide.contentPosition : "left-center",
    overlayOpacity: slide.overlayOpacity,
    autoplayDuration: slide.autoplayDuration,
  };
}

function SlideCard({
  slide,
  index,
  disabled,
  sortable,
  onPreview,
  onToggle,
  onDelete,
}: {
  slide: AdminSlide;
  index: number;
  disabled: boolean;
  sortable: boolean;
  onPreview: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  if (!sortable) {
    return (
      <SlideCardBody
        slide={slide}
        index={index}
        disabled={disabled}
        onPreview={onPreview}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    );
  }
  return (
    <SortableSlideCard
      slide={slide}
      index={index}
      disabled={disabled}
      onPreview={onPreview}
      onToggle={onToggle}
      onDelete={onDelete}
    />
  );
}

function SortableSlideCard(props: {
  slide: AdminSlide;
  index: number;
  disabled: boolean;
  onPreview: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const sortable = useSortable({ id: props.slide.id });
  return (
    <SlideCardBody
      {...props}
      setNodeRef={sortable.setNodeRef}
      handleProps={{ attributes: sortable.attributes, listeners: sortable.listeners }}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition ?? undefined }}
    />
  );
}

function SlideCardBody({
  slide,
  index,
  disabled,
  onPreview,
  onToggle,
  onDelete,
  setNodeRef,
  handleProps,
  style,
}: {
  slide: AdminSlide;
  index: number;
  disabled: boolean;
  onPreview: () => void;
  onToggle: () => void;
  onDelete: () => void;
  setNodeRef?: (node: HTMLElement | null) => void;
  handleProps?: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  };
  style?: CSSProperties;
}) {
  const schedule =
    slide.startsAt || slide.endsAt
      ? `${slide.startsAt ? slide.startsAt.slice(0, 10) : "—"} / ${slide.endsAt ? slide.endsAt.slice(0, 10) : "—"}`
      : null;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="admin-panel grid gap-4 p-3 sm:grid-cols-[auto_140px_minmax(0,1fr)_auto] sm:items-center"
    >
      <button
        type="button"
        className="admin-btn admin-btn-ghost min-h-10 w-10 px-0"
        {...handleProps?.attributes}
        {...handleProps?.listeners}
        aria-label="Sıralamayı değiştir"
        disabled={disabled}
      >
        <DotsSixVertical size={18} />
      </button>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] bg-[var(--admin-bg-2)]">
        {slide.desktopImage ? <Image src={slide.desktopImage} alt="" fill className="object-cover" sizes="180px" /> : null}
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm tabular-nums text-[var(--admin-muted)]">{String(index + 1).padStart(2, "0")}</p>
        {slide.eyebrow ? <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-[var(--admin-accent-2)]">{slide.eyebrow}</p> : null}
        <h2 className="truncate font-display text-xl">{slide.title}</h2>
        <p className="mt-1 text-sm" style={{ color: slide.isActive ? "var(--admin-success)" : "var(--admin-muted)" }}>
          {slide.isActive ? "Aktif" : "Pasif"}
          {schedule ? ` · ${schedule}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/sliders/${slide.id}`} className="admin-btn admin-btn-ghost min-h-9 px-3 text-xs">
          Düzenle
        </Link>
        <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-3 text-xs" onClick={onPreview}>
          Önizle
        </button>
        <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-3 text-xs" onClick={onToggle} disabled={disabled}>
          {slide.isActive ? "Pasif yap" : "Aktif yap"}
        </button>
        <button type="button" className="admin-btn admin-btn-danger min-h-9 px-3 text-xs" onClick={onDelete} disabled={disabled}>
          Sil
        </button>
      </div>
    </article>
  );
}
