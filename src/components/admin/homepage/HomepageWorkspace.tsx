"use client";

import { useMemo, useState, useTransition, useSyncExternalStore } from "react";
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
import { DotsSixVertical, Plus, X } from "@phosphor-icons/react";
import type { HomeSectionRecord, HomeSectionTemplate } from "@/lib/home-section-types";
import { HOME_SECTION_TEMPLATES } from "@/lib/home-section-types";
import {
  addHomeSection,
  deleteHomeSection,
  publishHomePage,
  reorderHomeSections,
  saveHomeSection,
  toggleHomeSection,
} from "@/lib/actions/home-sections";
import SlideImageField from "@/components/admin/sliders/SlideImageField";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

const LABELS: Record<string, string> = {
  "hero-slider": "Hero Slider",
  "hero-single": "Hero Single",
  "model-finder": "Model Finder",
  "featured-tractors": "Öne Çıkan Traktörler",
  "featured-equipment": "Öne Çıkan Makineler",
  "product-categories": "Tarım Makineleri",
  "image-text": "Görsel + Metin",
  "about-split": "Terra Ferro Tech",
  "services-list": "Hizmetler",
  "technical-highlight": "Teknik Spotlight",
  "cta-banner": "Teklif CTA",
  "contact-preview": "İletişim Önizleme",
  "gallery-preview": "Gallery Preview",
};

type ProductOption = { id: string; name: string; category: string };
type GalleryOption = { id: string; title: string | null; type: string };

export default function HomepageWorkspace({
  sections,
  products,
  galleryItems = [],
}: {
  sections: HomeSectionRecord[];
  products: ProductOption[];
  galleryItems?: GalleryOption[];
}) {
  const confirm = useConfirm();
  const { push } = useToast();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [items, setItems] = useState(sections);
  const [library, setLibrary] = useState(false);
  const [editing, setEditing] = useState<HomeSectionRecord | null>(null);
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
      await reorderHomeSections(next.map((s) => s.id));
      push("Sıra güncellendi");
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Ana Sayfa</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Bölüm ekleyin, sıralayın ve içeriği değiştirin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="admin-btn admin-btn-ghost" href="/?preview=1" target="_blank" rel="noreferrer">
            Önizle
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={pending}
            onClick={() => start(async () => { await publishHomePage(); push("Ana sayfa yayınlandı"); })}
          >
            Yayınla
          </button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => setLibrary(true)}>
            <Plus size={16} /> Bölüm Ekle
          </button>
        </div>
      </div>

      {mounted ? (
        <DndContext id="homepage-sections" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  disabled={pending}
                  onEdit={() => setEditing(section)}
                  onToggle={() =>
                    start(async () => {
                      await toggleHomeSection(section.id, !section.isVisible);
                      setItems((list) => list.map((s) => (s.id === section.id ? { ...s, isVisible: !s.isVisible } : s)));
                    })
                  }
                  onDelete={async () => {
                    const ok = await confirm({ title: "Bölüm silinsin mi?", body: "Bu işlem geri alınamaz.", confirmLabel: "Sil", danger: true });
                    if (!ok) return;
                    start(async () => {
                      await deleteHomeSection(section.id);
                      setItems((list) => list.filter((s) => s.id !== section.id));
                      push("Bölüm silindi");
                    });
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {items.map((section) => (
            <SectionRow key={section.id} section={section} disabled sortable={false} onEdit={() => setEditing(section)} onToggle={() => undefined} onDelete={() => undefined} />
          ))}
        </div>
      )}

      {library && (
        <LibraryModal
          onClose={() => setLibrary(false)}
          onPick={(template) =>
            start(async () => {
              const id = await addHomeSection(template.type, template.variant);
              setLibrary(false);
              push("Bölüm eklendi");
              window.location.reload();
              void id;
            })
          }
        />
      )}

      {editing && (
        <SectionEditor
          section={editing}
          products={products}
          galleryItems={galleryItems}
          onClose={() => setEditing(null)}
          onSaved={(next) => {
            setItems((list) => list.map((s) => (s.id === next.id ? next : s)));
            setEditing(null);
            push("Bölüm kaydedildi");
          }}
        />
      )}
    </div>
  );
}

function SectionRow({
  section,
  disabled,
  sortable = true,
  onEdit,
  onToggle,
  onDelete,
}: {
  section: HomeSectionRecord;
  disabled?: boolean;
  sortable?: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id, disabled: !sortable });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <article ref={setNodeRef} style={style} className="admin-panel flex items-center gap-3 p-4">
      <button type="button" className="text-[var(--admin-muted)]" aria-label="Sırala" {...attributes} {...listeners}>
        <DotsSixVertical size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{LABELS[section.type] ?? section.type}</p>
        <p className="truncate text-sm text-[var(--admin-text-2)]">{section.title || section.eyebrow || "İçerik yok"}</p>
      </div>
      <span className={`text-xs ${section.isVisible ? "text-[var(--admin-success)]" : "text-[var(--admin-muted)]"}`}>
        {section.isVisible ? "Aktif" : "Gizli"}
      </span>
      <button type="button" className="admin-btn admin-btn-ghost min-h-9" disabled={disabled} onClick={onToggle}>
        {section.isVisible ? "Gizle" : "Göster"}
      </button>
      <button type="button" className="admin-btn admin-btn-ghost min-h-9" onClick={onEdit}>
        Düzenle
      </button>
      <button type="button" className="admin-btn admin-btn-danger min-h-9" disabled={disabled} onClick={onDelete}>
        Sil
      </button>
    </article>
  );
}

function LibraryModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (template: HomeSectionTemplate) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto p-4">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={onClose} />
      <div className="admin-glass relative mx-auto my-8 w-full max-w-4xl rounded-[14px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-2xl">Bölüm Ekle</p>
          <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-2" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_SECTION_TEMPLATES.map((template) => (
            <button
              key={`${template.type}-${template.variant}`}
              type="button"
              className="rounded-[12px] border border-[var(--admin-border)] p-3 text-left hover:border-[var(--admin-accent)]"
              onClick={() => onPick(template)}
            >
              <TemplatePreview kind={template.preview} />
              <p className="mt-3 font-medium">{template.name}</p>
              <p className="mt-1 text-xs text-[var(--admin-text-2)]">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ kind }: { kind: HomeSectionTemplate["preview"] }) {
  const box = "h-20 overflow-hidden rounded-[8px] bg-[var(--admin-bg-3)] p-2";
  if (kind === "slider") {
    return <div className={box}><div className="h-full rounded bg-ink/80" /><div className="mt-[-18px] ml-2 h-2 w-16 rounded bg-white/50" /></div>;
  }
  if (kind === "split") {
    return (
      <div className={`${box} grid grid-cols-2 gap-1`}>
        <div className="rounded bg-[#c5282f]/70" />
        <div className="space-y-1 pt-2">
          <div className="h-2 w-10 rounded bg-white/40" />
          <div className="h-1.5 w-14 rounded bg-white/25" />
        </div>
      </div>
    );
  }
  if (kind === "cards") {
    return (
      <div className={`${box} grid grid-cols-3 gap-1`}>
        <div className="rounded bg-white/20" />
        <div className="rounded bg-white/20" />
        <div className="rounded bg-white/20" />
      </div>
    );
  }
  if (kind === "list") {
    return (
      <div className={`${box} space-y-1`}>
        <div className="h-2 rounded bg-white/30" />
        <div className="h-2 rounded bg-white/20" />
        <div className="h-2 rounded bg-white/20" />
      </div>
    );
  }
  if (kind === "banner") {
    return <div className={`${box} grid place-items-center`}><div className="h-full w-full rounded bg-[#c5282f]/80" /></div>;
  }
  if (kind === "finder") {
    return <div className={`${box} grid grid-cols-4 gap-1 pt-6`}><div className="h-4 rounded bg-white/30" /><div className="h-4 rounded bg-white/30" /><div className="h-4 rounded bg-white/30" /><div className="h-4 rounded bg-[#c5282f]/80" /></div>;
  }
  if (kind === "gallery") {
    return (
      <div className={`${box} grid grid-cols-3 grid-rows-2 gap-1`}>
        <div className="col-span-2 row-span-2 rounded bg-white/25" />
        <div className="rounded bg-white/20" />
        <div className="rounded bg-white/15" />
      </div>
    );
  }
  return <div className={`${box} bg-ink/70`} />;
}

function SectionEditor({
  section,
  products,
  galleryItems,
  onClose,
  onSaved,
}: {
  section: HomeSectionRecord;
  products: ProductOption[];
  galleryItems: GalleryOption[];
  onClose: () => void;
  onSaved: (section: HomeSectionRecord) => void;
}) {
  const { push } = useToast();
  const [form, setForm] = useState(section);
  const [saving, setSaving] = useState(false);
  const needsImage = ["hero-single", "image-text", "about-split", "technical-highlight"].includes(form.type);
  const needsProducts = ["featured-tractors", "featured-equipment", "technical-highlight"].includes(form.type);
  const productOptions = products.filter((p) =>
    form.type === "featured-equipment" ? p.category === "EQUIPMENT" : p.category === "TRACTOR"
  );
  const layouts =
    form.type === "image-text"
      ? [
          ["image-left", "Görsel Sol"],
          ["image-right", "Görsel Sağ"],
          ["full-width", "Tam Genişlik"],
          ["editorial", "Editorial"],
        ]
      : form.type === "about-split"
        ? [
            ["image-left", "Görsel Sol"],
            ["image-right", "Görsel Sağ"],
          ]
        : form.type === "hero-single"
          ? [
              ["left", "Sol"],
              ["center", "Merkez"],
            ]
          : form.type === "cta-banner"
            ? [
                ["red", "Kırmızı"],
                ["dark", "Koyu"],
              ]
            : [];

  async function save() {
    setSaving(true);
    const result = await saveHomeSection({
      id: form.id,
      type: form.type,
      variant: form.variant,
      title: form.title,
      eyebrow: form.eyebrow,
      body: form.body,
      image: form.image,
      mobileImage: form.mobileImage,
      ctaLabel: form.ctaLabel,
      ctaHref: form.ctaHref,
      config: form.config,
      isVisible: form.isVisible,
    });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    onSaved(form);
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={onClose} />
      <aside className="admin-glass absolute right-0 top-0 flex h-full w-[min(96vw,460px)] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-4">
          <p className="font-display text-xl">Bölümü Düzenle</p>
          <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-2" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {form.type === "hero-slider" ? (
            <p className="text-sm text-[var(--admin-text-2)]">Bu bölüm Slider Yönetimi&apos;ndeki aktif slaytları gösterir.</p>
          ) : (
            <>
              <Field label="Üst başlık" value={form.eyebrow} onChange={(eyebrow) => setForm((f) => ({ ...f, eyebrow }))} />
              <Field label="Başlık" value={form.title} onChange={(title) => setForm((f) => ({ ...f, title }))} />
              <label className="block">
                <span className="admin-label">Açıklama</span>
                <textarea className="admin-textarea min-h-24" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              </label>
              {needsImage && (
                <SlideImageField label="Görsel" value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} folder="slides" />
              )}
              <Field label="CTA Yazısı" value={form.ctaLabel} onChange={(ctaLabel) => setForm((f) => ({ ...f, ctaLabel }))} />
              <Field label="CTA Bağlantısı" value={form.ctaHref} onChange={(ctaHref) => setForm((f) => ({ ...f, ctaHref }))} />
              {layouts.length > 0 && (
                <div>
                  <p className="admin-label">Tasarım</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {layouts.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`rounded-[8px] border px-3 py-2 text-sm ${form.variant === value ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}
                        onClick={() => setForm((f) => ({ ...f, variant: value }))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {needsProducts && (
                <div>
                  <p className="admin-label">Ürünler</p>
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.config.source === "manual"}
                      onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, source: e.target.checked ? "manual" : "featured" } }))}
                    />
                    Manuel seç
                  </label>
                  {form.config.source === "manual" ? (
                    <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                      {productOptions.map((product) => {
                        const checked = form.config.productIds?.includes(product.id);
                        return (
                          <label key={product.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(checked)}
                              onChange={(e) => {
                                const current = form.config.productIds ?? [];
                                const productIds = e.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id);
                                setForm((f) => ({ ...f, config: { ...f.config, productIds, source: "manual" } }));
                              }}
                            />
                            {product.name}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <Field
                      label="Kaç ürün"
                      value={String(form.config.take ?? 3)}
                      onChange={(value) => setForm((f) => ({ ...f, config: { ...f.config, take: Number(value) || 3, source: "featured" } }))}
                    />
                  )}
                </div>
              )}
              {form.type === "about-split" && (
                <div className="space-y-2">
                  <p className="admin-label">Özellikler</p>
                  {(form.config.features ?? [{ title: "", body: "" }, { title: "", body: "" }, { title: "", body: "" }]).slice(0, 3).map((feature, index) => (
                    <div key={index} className="grid gap-2">
                      <input
                        className="admin-input"
                        placeholder="Başlık"
                        value={feature.title}
                        onChange={(e) => {
                          const features = [...(form.config.features ?? [{ title: "", body: "" }, { title: "", body: "" }, { title: "", body: "" }])];
                          features[index] = { ...features[index], title: e.target.value };
                          setForm((f) => ({ ...f, config: { ...f.config, features } }));
                        }}
                      />
                      <input
                        className="admin-input"
                        placeholder="Açıklama"
                        value={feature.body}
                        onChange={(e) => {
                          const features = [...(form.config.features ?? [{ title: "", body: "" }, { title: "", body: "" }, { title: "", body: "" }])];
                          features[index] = { ...features[index], body: e.target.value };
                          setForm((f) => ({ ...f, config: { ...f.config, features } }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {form.type === "product-categories" && (
                <Field
                  label="Gösterilecek kategori sayısı"
                  value={String(form.config.categoryLimit ?? 8)}
                  onChange={(value) => setForm((f) => ({ ...f, config: { ...f.config, categoryLimit: Number(value) || 8 } }))}
                />
              )}
              {form.type === "gallery-preview" && (
                <div>
                  <Field
                    label="Kaç içerik gösterilsin"
                    value={String(form.config.take ?? 6)}
                    onChange={(value) => setForm((f) => ({ ...f, config: { ...f.config, take: Number(value) || 6 } }))}
                  />
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.config.source === "manual"}
                      onChange={(e) => setForm((f) => ({ ...f, config: { ...f.config, source: e.target.checked ? "manual" : "latest" } }))}
                    />
                    Manuel seç
                  </label>
                  {form.config.source === "manual" ? (
                    <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                      {galleryItems.map((item) => {
                        const checked = form.config.galleryItemIds?.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(checked)}
                              onChange={(e) => {
                                const current = form.config.galleryItemIds ?? [];
                                const galleryItemIds = e.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id);
                                setForm((f) => ({ ...f, config: { ...f.config, galleryItemIds, source: "manual" } }));
                              }}
                            />
                            {item.title || item.id} · {item.type === "VIDEO" ? "Video" : "Fotoğraf"}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--admin-muted)]">Son eklenen yayınlanmış medya gösterilir.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="border-t border-[var(--admin-border)] p-4">
          <button type="button" className="admin-btn admin-btn-primary w-full" disabled={saving} onClick={() => void save()}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
