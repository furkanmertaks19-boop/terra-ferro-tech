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
import { uid, type SpecGroup } from "@/lib/admin-content";

export default function SpecBuilder({
  groups,
  onChange,
}: {
  groups: SpecGroup[];
  onChange: (groups: SpecGroup[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = groups.findIndex((g) => g.id === active.id);
    const newIndex = groups.findIndex((g) => g.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(groups, oldIndex, newIndex));
  }

  return (
    <div className="space-y-3">
      <DndContext id="product-spec-groups" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={groups.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          {groups.map((group, gi) => (
            <GroupCard
              key={group.id}
              group={group}
              onChange={(next) => onChange(groups.map((g) => (g.id === group.id ? next : g)))}
              onRemove={() => onChange(groups.filter((_, i) => i !== gi))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        className="admin-btn admin-btn-ghost"
        onClick={() => onChange([...groups, { id: uid(), title: "Yeni grup", rows: [{ id: uid(), key: "", value: "" }] }])}
      >
        + Özellik Grubu
      </button>
    </div>
  );
}

function GroupCard({
  group,
  onChange,
  onRemove,
}: {
  group: SpecGroup;
  onChange: (g: SpecGroup) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: group.id });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onRowDrag(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.rows.findIndex((r) => r.id === active.id);
    const newIndex = group.rows.findIndex((r) => r.id === over.id);
    onChange({ ...group, rows: arrayMove(group.rows, oldIndex, newIndex) });
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="admin-panel p-3">
      <div className="mb-3 flex items-center gap-2">
        <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" {...attributes} {...listeners} aria-label="Grup sürükle">
          <DotsSixVertical size={14} />
        </button>
        <input className="admin-input" value={group.title} onChange={(e) => onChange({ ...group, title: e.target.value })} />
        <button type="button" className="admin-btn admin-btn-danger min-h-8" onClick={onRemove}>Sil</button>
      </div>
      <DndContext id={`product-spec-rows-${group.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onRowDrag}>
        <SortableContext items={group.rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {group.rows.map((row, ri) => (
              <Row
                key={row.id}
                row={row}
                onChange={(next) => onChange({ ...group, rows: group.rows.map((r) => (r.id === row.id ? next : r)) })}
                onRemove={() => onChange({ ...group, rows: group.rows.filter((_, i) => i !== ri) })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        className="admin-btn admin-btn-ghost mt-2 min-h-8"
        onClick={() => onChange({ ...group, rows: [...group.rows, { id: uid(), key: "", value: "" }] })}
      >
        + Teknik Özellik
      </button>
    </div>
  );
}

function Row({
  row,
  onChange,
  onRemove,
}: {
  row: SpecGroup["rows"][number];
  onChange: (row: SpecGroup["rows"][number]) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
      <button type="button" className="text-[var(--admin-muted)]" {...attributes} {...listeners} aria-label="Özellik sürükle">
        <DotsSixVertical size={14} />
      </button>
      <input className="admin-input" placeholder="Özellik" value={row.key} onChange={(e) => onChange({ ...row, key: e.target.value })} />
      <input className="admin-input" placeholder="Değer" value={row.value} onChange={(e) => onChange({ ...row, value: e.target.value })} />
      <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" onClick={onRemove}>×</button>
    </div>
  );
}
