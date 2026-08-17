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
import type { PageFeatureItem } from "@/lib/page-cms";

export default function FeatureListEditor({
  items,
  onChange,
  withImage,
  addLabel,
}: {
  items: PageFeatureItem[];
  onChange: (items: PageFeatureItem[]) => void;
  withImage?: boolean;
  addLabel: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((item) => item.id);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, sortOrder: index })));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? <p className="text-sm text-[var(--admin-text-2)]">Henüz madde yok.</p> : null}
      <DndContext id="page-features" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <FeatureRow
                key={item.id}
                item={item}
                withImage={withImage}
                onChange={(next) => onChange(items.map((row) => (row.id === item.id ? next : row)))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={() =>
          onChange([
            ...items,
            { id: uid(), title: "", body: "", image: null, sortOrder: items.length, isActive: true },
          ])
        }
      >
        {addLabel}
      </button>
    </div>
  );
}

function FeatureRow({
  item,
  withImage,
  onChange,
}: {
  item: PageFeatureItem;
  withImage?: boolean;
  onChange: (item: PageFeatureItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-[12px] border border-[var(--admin-border)] p-3 ${item.isActive ? "" : "opacity-60"}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <button type="button" className="text-[var(--admin-muted)]" aria-label="Sırala" {...attributes} {...listeners}>
          <DotsSixVertical size={18} />
        </button>
        <p className="flex-1 text-xs font-semibold tracking-[0.14em] uppercase text-[var(--admin-muted)]">Madde</p>
        <button
          type="button"
          className={`admin-btn min-h-8 px-3 text-xs ${item.isActive ? "admin-btn-ghost" : "admin-btn-primary"}`}
          onClick={() => onChange({ ...item, isActive: !item.isActive })}
        >
          {item.isActive ? "Gizle" : "Göster"}
        </button>
      </div>
      <label className="admin-label">Başlık</label>
      <input className="admin-input" value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })} />
      <label className="admin-label mt-3">Açıklama</label>
      <textarea className="admin-textarea min-h-20" value={item.body} onChange={(e) => onChange({ ...item, body: e.target.value })} />
      {withImage ? (
        <div className="mt-3">
          <SlideImageField
            label="Görsel"
            folder="pages"
            value={item.image ?? null}
            onChange={(url) => onChange({ ...item, image: url })}
          />
        </div>
      ) : null}
    </div>
  );
}
