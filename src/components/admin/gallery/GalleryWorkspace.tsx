"use client";

import { useMemo, useState, useTransition, useSyncExternalStore } from "react";
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
import { DotsSixVertical, Play, Plus } from "@phosphor-icons/react";
import { publicGalleryThumb } from "@/lib/cloudinary-media";
import {
  createGalleryCategory,
  createGalleryItems,
  deleteGalleryItem,
  reorderGalleryItems,
  saveGalleryItem,
  toggleGalleryItem,
} from "@/lib/actions/gallery";
import { uploadMediaWithProgress, uploadVideoWithProgress } from "@/components/admin/editor/upload";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import { CLIENT_MAX_VIDEO_MB } from "@/lib/upload-limits";

export type AdminGalleryCategory = { id: string; name: string; slug: string };
export type AdminGalleryItem = {
  id: string;
  type: "IMAGE" | "VIDEO";
  title: string | null;
  description: string | null;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  mediaUrl: string;
  publicId: string | null;
  thumbnailUrl: string | null;
  posterPublicId: string | null;
  altText: string | null;
  sortOrder: number;
  isPublished: boolean;
};

type QueueItem = { name: string; progress: number; status: "waiting" | "uploading" | "done" | "error" };

export default function GalleryWorkspace({
  items: initialItems,
  categories: initialCategories,
}: {
  items: AdminGalleryItem[];
  categories: AdminGalleryCategory[];
}) {
  const confirm = useConfirm();
  const { push } = useToast();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [items, setItems] = useState(initialItems);
  const [categories, setCategories] = useState(initialCategories);
  const [composer, setComposer] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryItem | null>(null);
  const [pending, start] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = useMemo(() => items.map((item) => item.id), [items]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    start(async () => {
      await reorderGalleryItems(next.map((item) => item.id));
      push("Sıra güncellendi");
    });
  }

  const cards = items.map((item) => (
    <GalleryCard
      key={item.id}
      item={item}
      sortable={mounted}
      disabled={pending}
      onEdit={() => setEditing(item)}
      onToggle={() =>
        start(async () => {
          await toggleGalleryItem(item.id, !item.isPublished);
          setItems((list) => list.map((row) => (row.id === item.id ? { ...row, isPublished: !row.isPublished } : row)));
          push(item.isPublished ? "Gizlendi" : "Yayınlandı");
        })
      }
      onDelete={async () => {
        const ok = await confirm({
          title: item.type === "VIDEO" ? "Bu video galeriden kaldırılsın mı?" : "Bu fotoğraf galeriden kaldırılsın mı?",
          body: "Bu işlem geri alınamaz.",
          confirmLabel: "Sil",
          danger: true,
        });
        if (!ok) return;
        start(async () => {
          await deleteGalleryItem(item.id);
          setItems((list) => list.filter((row) => row.id !== item.id));
          push("Medya silindi");
        });
      }}
    />
  ));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Galeri</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Web sitesinde yayınlanan fotoğraf ve videoları yönetin.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setComposer(true)}>
          <Plus size={16} /> Medya Ekle
        </button>
      </div>

      {items.length === 0 ? (
        <div className="admin-panel grid min-h-72 place-items-center p-8 text-center">
          <div>
            <p className="font-display text-2xl">Henüz medya yok.</p>
            <button type="button" className="admin-btn admin-btn-primary mt-5" onClick={() => setComposer(true)}>
              İlk medyayı ekle
            </button>
          </div>
        </div>
      ) : mounted ? (
        <DndContext id="admin-gallery" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{cards}</div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{cards}</div>
      )}

      {composer ? (
        <Composer
          categories={categories}
          onClose={() => setComposer(false)}
          onCreated={(created) => {
            setItems((list) => [...list, ...created]);
            setComposer(false);
          }}
          onCategory={async (name) => {
            const result = await createGalleryCategory(name);
            if (!result.ok) {
              push(result.error, "error");
              return null;
            }
            const next = { id: result.id, name, slug: name };
            setCategories((list) => [...list, next]);
            return next.id;
          }}
        />
      ) : null}

      {editing ? (
        <Editor
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(next) => {
            setItems((list) => list.map((row) => (row.id === next.id ? next : row)));
            setEditing(null);
          }}
          onCategory={async (name) => {
            const result = await createGalleryCategory(name);
            if (!result.ok) {
              push(result.error, "error");
              return null;
            }
            const next = { id: result.id, name, slug: name };
            setCategories((list) => [...list, next]);
            return next.id;
          }}
        />
      ) : null}
    </div>
  );
}

function GalleryCard({
  item,
  sortable,
  disabled,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: AdminGalleryItem;
  sortable: boolean;
  disabled: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id, disabled: !sortable });
  const thumb = publicGalleryThumb(item);
  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="admin-panel overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-[var(--admin-bg-3)]">
        <Image src={thumb} alt={item.altText || item.title || ""} fill className="object-cover" sizes="280px" />
        {item.type === "VIDEO" ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white">
              <Play size={16} weight="fill" />
            </span>
          </span>
        ) : null}
        <button
          type="button"
          className="absolute left-2 top-2 admin-btn admin-btn-ghost min-h-8 px-2"
          {...attributes}
          {...listeners}
          aria-label="Sürükle"
          disabled={!sortable || disabled}
        >
          <DotsSixVertical size={14} />
        </button>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title || "Başlıksız"}</p>
            <p className="text-xs text-[var(--admin-muted)]">
              {item.type === "VIDEO" ? "Video" : "Fotoğraf"}
              {item.category ? ` · ${item.category.name}` : ""}
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.isPublished ? "bg-[rgb(216_169_54/0.16)] text-[var(--admin-accent-2)]" : "bg-[var(--admin-surface-2)] text-[var(--admin-muted)]"}`}>
            {item.isPublished ? "Yayında" : "Gizli"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 flex-1 px-2 text-xs" onClick={onEdit}>
            Düzenle
          </button>
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2 text-xs" onClick={onToggle}>
            {item.isPublished ? "Gizle" : "Yayınla"}
          </button>
          <button type="button" className="admin-btn admin-btn-danger min-h-8 px-2 text-xs" onClick={onDelete}>
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

function Composer({
  categories,
  onClose,
  onCreated,
  onCategory,
}: {
  categories: AdminGalleryCategory[];
  onClose: () => void;
  onCreated: (items: AdminGalleryItem[]) => void;
  onCategory: (name: string) => Promise<string | null>;
}) {
  const { push } = useToast();
  const [kind, setKind] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [altText, setAltText] = useState("");
  const [publish, setPublish] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPublicId, setVideoPublicId] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterPublicId, setPosterPublicId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");

  async function addCategory() {
    const id = await onCategory(newCat);
    if (!id) return;
    setCategoryId(id);
    setNewCat("");
    push("Kategori eklendi");
  }

  async function uploadPhotos(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    setQueue(list.map((file) => ({ name: file.name, progress: 0, status: "waiting" })));
    const uploaded: Array<{ mediaUrl: string; publicId: string }> = [];
    for (let i = 0; i < list.length; i += 1) {
      setQueue((rows) => rows.map((row, idx) => (idx === i ? { ...row, status: "uploading" } : row)));
      const result = await uploadMediaWithProgress(
        list[i],
        (n) => setQueue((rows) => rows.map((row, idx) => (idx === i ? { ...row, progress: n } : row))),
        "gallery"
      );
      if (result?.url) {
        uploaded.push({ mediaUrl: result.url, publicId: result.publicId });
        setQueue((rows) => rows.map((row, idx) => (idx === i ? { ...row, progress: 100, status: "done" } : row)));
      } else {
        setQueue((rows) => rows.map((row, idx) => (idx === i ? { ...row, status: "error" } : row)));
      }
    }
    if (!uploaded.length) {
      push("Yükleme başarısız", "error");
      setBusy(false);
      return;
    }
    const created = await createGalleryItems(
      uploaded.map((file, index) => ({
        type: "IMAGE" as const,
        mediaUrl: file.mediaUrl,
        publicId: file.publicId,
        title: list.length === 1 ? title || null : index === 0 ? title || null : null,
        description: list.length === 1 ? description || null : null,
        altText: altText || null,
        categoryId: categoryId || null,
      }))
    );
    setBusy(false);
    if (!created.ok) {
      push(created.error, "error");
      return;
    }
    if (publish) {
      await Promise.all(created.ids.map((id) => toggleGalleryItem(id, true)));
    }
    push(`${uploaded.length} fotoğraf eklendi`);
    onCreated(
      uploaded.map((file, index) => ({
        id: created.ids[index],
        type: "IMAGE",
        title: index === 0 ? title || null : null,
        description: description || null,
        categoryId: categoryId || null,
        category: categories.find((c) => c.id === categoryId) ?? null,
        mediaUrl: file.mediaUrl,
        publicId: file.publicId,
        thumbnailUrl: file.mediaUrl,
        posterPublicId: null,
        altText: altText || null,
        sortOrder: 999,
        isPublished: publish,
      }))
    );
  }

  async function uploadVideo(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    setBusy(true);
    setQueue([{ name: file.name, progress: 0, status: "uploading" }]);
    const result = await uploadVideoWithProgress(file, (n) => setQueue([{ name: file.name, progress: n, status: "uploading" }]));
    setBusy(false);
    if (!result?.url) {
      setQueue([{ name: file.name, progress: 0, status: "error" }]);
      push("Video yüklenemedi", "error");
      return;
    }
    setVideoUrl(result.url);
    setVideoPublicId(result.publicId);
    if (result.posterUrl) setPosterUrl(result.posterUrl);
    setQueue([{ name: file.name, progress: 100, status: "done" }]);
    push("Video yüklendi");
  }

  async function uploadPoster(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (!file) return;
    const result = await uploadMediaWithProgress(file, () => undefined, "gallery");
    if (!result?.url) {
      push("Kapak yüklenemedi", "error");
      return;
    }
    setPosterUrl(result.url);
    setPosterPublicId(result.publicId);
  }

  async function saveVideo() {
    if (!videoUrl) {
      push("Önce video yükleyin", "error");
      return;
    }
    setBusy(true);
    const created = await createGalleryItems([
      {
        type: "VIDEO",
        mediaUrl: videoUrl,
        publicId: videoPublicId,
        thumbnailUrl: posterUrl,
        posterPublicId,
        title: title || null,
        description: description || null,
        categoryId: categoryId || null,
      },
    ]);
    setBusy(false);
    if (!created.ok) {
      push(created.error, "error");
      return;
    }
    if (publish) await toggleGalleryItem(created.id, true);
    push("Video eklendi");
    onCreated([
      {
        id: created.id,
        type: "VIDEO",
        title: title || null,
        description: description || null,
        categoryId: categoryId || null,
        category: categories.find((c) => c.id === categoryId) ?? null,
        mediaUrl: videoUrl,
        publicId: videoPublicId,
        thumbnailUrl: posterUrl,
        posterPublicId,
        altText: null,
        sortOrder: 999,
        isPublished: publish,
      },
    ]);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={onClose} />
      <div className="admin-glass relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-[14px] p-5">
        <h2 className="font-display text-2xl">Medya Ekle</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["IMAGE", "VIDEO"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`rounded-[8px] border px-3 py-3 text-sm ${kind === value ? "border-[var(--admin-accent)] bg-[rgb(216_169_54/0.12)]" : "border-[var(--admin-border)]"}`}
              onClick={() => setKind(value)}
            >
              {kind === value ? "●" : "○"} {value === "IMAGE" ? "Fotoğraf" : "Video"}
            </button>
          ))}
        </div>

        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (kind === "IMAGE") void uploadPhotos(e.dataTransfer.files);
            else void uploadVideo(e.dataTransfer.files);
          }}
          className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[var(--admin-border-strong)] bg-[var(--admin-surface)] px-4 text-center text-sm text-[var(--admin-text-2)]"
        >
          <span>{kind === "IMAGE" ? "Fotoğrafı buraya sürükleyin" : "Videoyu buraya sürükleyin"}</span>
          <span className="mt-1 text-[var(--admin-muted)]">veya Dosya Seç</span>
          {kind === "VIDEO" ? <span className="mt-1 text-xs text-[var(--admin-muted)]">MP4 / WebM · en fazla {CLIENT_MAX_VIDEO_MB} MB</span> : null}
          <input
            type="file"
            accept={kind === "IMAGE" ? "image/jpeg,image/png,image/webp,image/avif" : "video/mp4,video/webm"}
            multiple={kind === "IMAGE"}
            className="hidden"
            onChange={(e) => e.target.files && (kind === "IMAGE" ? void uploadPhotos(e.target.files) : void uploadVideo(e.target.files))}
          />
        </label>

        {queue.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs">
            {queue.map((row) => (
              <li key={row.name} className="flex items-center justify-between gap-3">
                <span className="truncate">{row.name}</span>
                <span className="tabular-nums text-[var(--admin-muted)]">
                  {row.status === "waiting" ? "Bekliyor" : row.status === "error" ? "Hata" : `%${row.progress}`}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {kind === "VIDEO" && videoUrl ? (
          <div className="mt-3">
            <p className="admin-label">Kapak Görseli / Poster</p>
            {posterUrl ? (
              <div className="relative mt-1 aspect-video overflow-hidden rounded-[10px] bg-[var(--admin-bg-3)]">
                <Image src={posterUrl} alt="" fill className="object-cover" sizes="480px" />
              </div>
            ) : null}
            <label className="admin-btn admin-btn-ghost mt-2 min-h-8 cursor-pointer px-3 text-xs">
              Poster yükle
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && void uploadPoster(e.target.files)} />
            </label>
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="admin-label">Başlık</span>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="admin-label">Açıklama</span>
            <textarea className="admin-textarea min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {kind === "IMAGE" ? (
            <label className="block">
              <span className="admin-label">Alt text</span>
              <input className="admin-input" value={altText} onChange={(e) => setAltText(e.target.value)} />
            </label>
          ) : null}
          <label className="block">
            <span className="admin-label">Kategori</span>
            <select className="admin-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Kategorisiz</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <input className="admin-input" placeholder="Yeni kategori" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => void addCategory()}>
              Ekle
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
            Web sitesinde göster
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            İptal
          </button>
          {kind === "VIDEO" ? (
            <button type="button" className="admin-btn admin-btn-primary" disabled={busy || !videoUrl} onClick={() => void saveVideo()}>
              Videoyu Ekle
            </button>
          ) : (
            <p className="self-center text-xs text-[var(--admin-muted)]">Fotoğraflar yüklendiğinde listeye eklenir.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Editor({
  item,
  categories,
  onClose,
  onSaved,
  onCategory,
}: {
  item: AdminGalleryItem;
  categories: AdminGalleryCategory[];
  onClose: () => void;
  onSaved: (item: AdminGalleryItem) => void;
  onCategory: (name: string) => Promise<string | null>;
}) {
  const { push } = useToast();
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState("");

  async function save() {
    setSaving(true);
    const result = await saveGalleryItem({
      id: form.id,
      type: form.type,
      title: form.title,
      description: form.description,
      categoryId: form.categoryId,
      mediaUrl: form.mediaUrl,
      publicId: form.publicId,
      thumbnailUrl: form.thumbnailUrl,
      posterPublicId: form.posterPublicId,
      altText: form.altText,
      isPublished: form.isPublished,
    });
    setSaving(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    push(form.isPublished ? "Yayınlandı" : "Kaydedildi");
    onSaved({ ...form, category: categories.find((c) => c.id === form.categoryId) ?? null });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={onClose} />
      <div className="admin-glass relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[14px] p-5">
        <h2 className="font-display text-2xl">Medyayı Düzenle</h2>
        <div className="relative mt-4 aspect-video overflow-hidden rounded-[10px] bg-[var(--admin-bg-3)]">
          <Image src={publicGalleryThumb(form)} alt="" fill className="object-cover" sizes="480px" />
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="admin-label">Başlık</span>
            <input className="admin-input" value={form.title ?? ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className="block">
            <span className="admin-label">Açıklama</span>
            <textarea className="admin-textarea min-h-20" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          {form.type === "IMAGE" ? (
            <label className="block">
              <span className="admin-label">Alt text</span>
              <input className="admin-input" value={form.altText ?? ""} onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))} />
            </label>
          ) : null}
          <label className="block">
            <span className="admin-label">Kategori</span>
            <select className="admin-input" value={form.categoryId ?? ""} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value || null }))}>
              <option value="">Kategorisiz</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <input className="admin-input" placeholder="Yeni kategori" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={async () => {
                const id = await onCategory(newCat);
                if (!id) return;
                setForm((f) => ({ ...f, categoryId: id }));
                setNewCat("");
              }}
            >
              Ekle
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />
            Web sitesinde göster
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={() => void save()}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
