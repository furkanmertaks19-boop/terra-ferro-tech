"use client";

import { useEffect, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical, DotsThree, Funnel, SquaresFour, Table, X } from "@phosphor-icons/react";
import type { AdminProduct } from "@/lib/types";
import { Category, ProductStatus } from "@prisma/client";
import { productHref } from "@/lib/product-path";
import { bulkDeleteProducts, bulkUpdateProducts, deleteProduct, duplicateProduct, reorderProducts } from "@/lib/actions/products";
import { useConfirm } from "../ui/ConfirmDialog";
import { useToast } from "../ui/Toast";
import {
  PRODUCT_SORTS,
  PRODUCT_TABS,
  SORT_LABELS,
  TAB_LABELS,
  advancedFilterCount,
  canReorderProducts,
  productsHref,
  tabCategory,
  type AdminProductQuery,
  type ProductSort,
  type ProductTab,
} from "@/lib/admin-products-query";

function productSignature(products: AdminProduct[]) {
  return products.map((product) => product.id).join(",");
}

export default function ProductsWorkspace({
  products,
  query,
  counts,
  seriesOptions,
  subcategoryOptions,
  stageOptions,
}: {
  products: AdminProduct[];
  query: AdminProductQuery;
  counts: Record<ProductTab, number>;
  seriesOptions: string[];
  subcategoryOptions: string[];
  stageOptions: string[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const { push } = useToast();
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(query);
  const [items, setItems] = useState(products);
  const [sourceKey, setSourceKey] = useState(productSignature(products));
  const [pending, start] = useTransition();
  const nextKey = productSignature(products);
  useEffect(() => {
    if (nextKey === sourceKey) return;
    setSourceKey(nextKey);
    setItems(products);
  }, [nextKey, products, sourceKey]);
  const filterCount = advancedFilterCount(query);
  const reorderable = canReorderProducts(query);
  const mixed = query.type === "all" || query.type === "draft" || query.type === "archive";

  const allIds = items.map((product) => product.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function go(patch: Partial<Record<keyof AdminProductQuery, string | null>>) {
    router.push(productsHref(query, patch));
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    go({ q: value || null });
  }

  function applyFilters() {
    go({
      series: draft.series || null,
      subcategory: draft.subcategory || null,
      status: draft.status || null,
      hpMin: draft.hpMin || null,
      hpMax: draft.hpMax || null,
      cabin: draft.cabin || null,
      stage: draft.stage || null,
      noImage: draft.noImage || null,
    });
    setFiltersOpen(false);
  }

  function clearFilters() {
    go({
      series: null,
      subcategory: null,
      status: null,
      hpMin: null,
      hpMax: null,
      cabin: null,
      stage: null,
      noImage: null,
    });
    setDraft({ ...query, series: "", subcategory: "", status: "", hpMin: "", hpMax: "", cabin: "", stage: "", noImage: "" });
    setFiltersOpen(false);
  }

  function onDragEnd(event: DragEndEvent) {
    if (!reorderable) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const category = tabCategory(query.type);
    if (!category) return;
    const oldIndex = items.findIndex((product) => product.id === active.id);
    const newIndex = items.findIndex((product) => product.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    start(async () => {
      await reorderProducts(category, next.map((product) => product.id));
      push("Sıra kaydedildi");
    });
  }

  const list = (
    <ProductCollection
      items={items}
      view={view}
      mixed={mixed}
      reorderable={reorderable}
      selected={selected}
      setSelected={setSelected}
      menu={menu}
      setMenu={setMenu}
      pending={pending}
      start={start}
      confirm={confirm}
      push={push}
      router={router}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] lg:flex-row lg:items-end lg:justify-between">
        <div className="overflow-x-auto">
          <nav className="flex min-w-max gap-1" aria-label="Ürün kategorileri">
            {PRODUCT_TABS.map((tab) => {
              const active = query.type === tab;
              return (
                <Link
                  key={tab}
                  href={productsHref(query, { type: tab === "all" ? null : tab })}
                  className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium transition ${
                    active
                      ? "border-[var(--admin-accent)] text-[var(--admin-accent-2)]"
                      : "border-transparent text-[var(--admin-text-2)] hover:text-[var(--admin-text)]"
                  }`}
                >
                  {TAB_LABELS[tab]}
                  <span className="ml-1.5 tabular-nums text-[var(--admin-muted)]">({counts[tab]})</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <form onSubmit={onSearch} className="w-full pb-2 sm:max-w-xs lg:pb-1.5">
          <label className="sr-only" htmlFor="product-search">
            Ürün ara
          </label>
          <input id="product-search" name="q" key={query.q} className="admin-input" placeholder="Ürün ara..." defaultValue={query.q} />
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="admin-btn admin-btn-ghost min-h-10"
          onClick={() => {
            setDraft(query);
            setFiltersOpen(true);
          }}
        >
          <Funnel size={16} />
          Filtreler{filterCount ? ` (${filterCount})` : ""}
        </button>
        <label className="sr-only" htmlFor="product-sort">
          Sırala
        </label>
        <select
          id="product-sort"
          className="admin-select w-auto min-w-[168px]"
          value={query.sort}
          onChange={(event) => go({ sort: event.target.value as ProductSort })}
        >
          {PRODUCT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </select>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <button type="button" className={`admin-btn ${view === "table" ? "admin-btn-primary" : "admin-btn-ghost"}`} onClick={() => setView("table")} aria-label="Tablo">
            <Table size={16} />
          </button>
          <button type="button" className={`admin-btn ${view === "grid" ? "admin-btn-primary" : "admin-btn-ghost"}`} onClick={() => setView("grid")} aria-label="Izgara">
            <SquaresFour size={16} />
          </button>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
            + Yeni Ürün
          </Link>
          <Link href="/admin/products/new?category=TRACTOR" className="admin-btn admin-btn-ghost min-h-10 hidden sm:inline-flex">
            + Yeni Traktör
          </Link>
          <Link href="/admin/products/new?category=EQUIPMENT" className="admin-btn admin-btn-ghost min-h-10 hidden sm:inline-flex">
            + Yeni Tarım Makinesi
          </Link>
          <details className="relative sm:hidden">
            <summary className="admin-btn admin-btn-ghost min-h-10 cursor-pointer list-none px-2.5 [&::-webkit-details-marker]:hidden">+</summary>
            <div className="absolute right-0 z-20 mt-1 w-52 rounded-[10px] border border-[var(--admin-border)] bg-white p-1 shadow-[var(--admin-shadow)]">
              <Link href="/admin/products/new?category=TRACTOR" className="block rounded px-3 py-2 text-sm hover:bg-[var(--admin-surface-2)]">
                + Yeni Traktör
              </Link>
              <Link href="/admin/products/new?category=EQUIPMENT" className="block rounded px-3 py-2 text-sm hover:bg-[var(--admin-surface-2)]">
                + Yeni Tarım Makinesi
              </Link>
            </div>
          </details>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--admin-text-2)]">
        <p>{items.length} ürün</p>
        {query.type === "tractor" || query.type === "equipment" ? (
          <p className="text-xs text-[var(--admin-muted)]">
            {reorderable ? "Sıralamayı sürükleyerek değiştirin. Bu sıra kaydedilir." : "Sürükleyerek sıralamak için “Manuel sıralama” seçin."}
          </p>
        ) : null}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[var(--admin-border)] bg-white px-3 py-2 text-sm">
          <span>{selected.length} seçili</span>
          <button className="admin-btn admin-btn-ghost" disabled={pending} onClick={() => start(async () => { await bulkUpdateProducts(selected, { status: ProductStatus.PUBLISHED }); push("Ürünler yayına alındı"); })}>
            Yayına al
          </button>
          <button className="admin-btn admin-btn-ghost" disabled={pending} onClick={() => start(async () => { await bulkUpdateProducts(selected, { status: ProductStatus.ARCHIVED }); push("Arşivlendi"); })}>
            Arşivle
          </button>
          <button
            className="admin-btn admin-btn-danger"
            onClick={async () => {
              const ok = await confirm({ title: "Seçili ürünler silinsin mi?", body: "Bu işlem geri alınamaz.", confirmLabel: "Sil", danger: true });
              if (!ok) return;
              start(async () => {
                await bulkDeleteProducts(selected);
                setSelected([]);
                push("Ürünler silindi", "info");
              });
            }}
          >
            Sil
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="admin-panel px-6 py-16 text-center">
          <p className="font-display text-2xl">Bu görünümde ürün yok.</p>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary mt-5">
            + Ürün Ekle
          </Link>
        </div>
      ) : (
        <DndContext id="admin-products" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={allIds} strategy={view === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
            {list}
          </SortableContext>
        </DndContext>
      )}

      {filtersOpen ? (
        <div className="fixed inset-0 z-[80]">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Kapat" onClick={() => setFiltersOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(100vw,380px)] flex-col border-l border-[var(--admin-border)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-4">
              <p className="font-display text-xl">Filtreler</p>
              <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-2" onClick={() => setFiltersOpen(false)} aria-label="Kapat">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block">
                <span className="admin-label">Seri</span>
                <select className="admin-select" value={draft.series} onChange={(event) => setDraft((current) => ({ ...current, series: event.target.value }))}>
                  <option value="">Tümü</option>
                  {seriesOptions.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Alt kategori</span>
                <select className="admin-select" value={draft.subcategory} onChange={(event) => setDraft((current) => ({ ...current, subcategory: event.target.value }))}>
                  <option value="">Tümü</option>
                  {subcategoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              {query.type === "tractor" ? (
                <>
                  <div>
                    <span className="admin-label">HP aralığı</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="admin-input" inputMode="numeric" placeholder="Min" value={draft.hpMin} onChange={(event) => setDraft((current) => ({ ...current, hpMin: event.target.value }))} />
                      <input className="admin-input" inputMode="numeric" placeholder="Max" value={draft.hpMax} onChange={(event) => setDraft((current) => ({ ...current, hpMax: event.target.value }))} />
                    </div>
                  </div>
                  <label className="block">
                    <span className="admin-label">Kabin / ROPS</span>
                    <select className="admin-select" value={draft.cabin} onChange={(event) => setDraft((current) => ({ ...current, cabin: event.target.value }))}>
                      <option value="">Tümü</option>
                      <option value="cabin">Kabin</option>
                      <option value="rops">ROPS</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="admin-label">Stage</span>
                    <select className="admin-select" value={draft.stage} onChange={(event) => setDraft((current) => ({ ...current, stage: event.target.value }))}>
                      <option value="">Tümü</option>
                      {stageOptions.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
              {query.type !== "draft" && query.type !== "archive" ? (
                <label className="block">
                  <span className="admin-label">Yayın durumu</span>
                  <select className="admin-select" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                    <option value="">Tümü</option>
                    <option value={ProductStatus.PUBLISHED}>Yayında</option>
                    <option value={ProductStatus.DRAFT}>Taslak</option>
                    <option value={ProductStatus.ARCHIVED}>Arşiv</option>
                  </select>
                </label>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.noImage === "1"} onChange={(event) => setDraft((current) => ({ ...current, noImage: event.target.checked ? "1" : "" }))} />
                Fotoğrafı olmayanlar
              </label>
            </div>
            <div className="flex gap-2 border-t border-[var(--admin-border)] p-4">
              <button type="button" className="admin-btn admin-btn-ghost flex-1" onClick={clearFilters}>
                Temizle
              </button>
              <button type="button" className="admin-btn admin-btn-primary flex-1" onClick={applyFilters}>
                Uygula
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function ProductCollection({
  items,
  view,
  mixed,
  reorderable,
  selected,
  setSelected,
  menu,
  setMenu,
  pending,
  start,
  confirm,
  push,
  router,
}: {
  items: AdminProduct[];
  view: "table" | "grid";
  mixed: boolean;
  reorderable: boolean;
  selected: string[];
  setSelected: (ids: string[] | ((current: string[]) => string[])) => void;
  menu: string | null;
  setMenu: (id: string | null) => void;
  pending: boolean;
  start: (fn: () => Promise<void>) => void;
  confirm: (opts: { title: string; body: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  push: (message: string, kind?: "success" | "error" | "info") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const allIds = items.map((product) => product.id);

  if (view === "grid") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            mixed={mixed}
            reorderable={reorderable}
            menu={menu}
            setMenu={setMenu}
            start={start}
            confirm={confirm}
            push={push}
            router={router}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="admin-panel hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-[var(--admin-muted)]">
            <tr>
              <th className="px-3 py-3">
                <input type="checkbox" checked={selected.length === allIds.length && allIds.length > 0} onChange={(event) => setSelected(event.target.checked ? allIds : [])} aria-label="Tümünü seç" />
              </th>
              {reorderable ? <th className="w-10 px-1 py-3" /> : null}
              <th className="px-3 py-3">Görsel</th>
              <th className="px-3 py-3">Ürün</th>
              <th className="px-3 py-3">Seri / Alt kategori</th>
              <th className="px-3 py-3">Durum</th>
              <th className="px-3 py-3">Güncelleme</th>
              <th className="px-3 py-3">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                mixed={mixed}
                reorderable={reorderable}
                selected={selected.includes(product.id)}
                onToggle={(checked) => setSelected((current) => (checked ? [...current, product.id] : current.filter((id) => id !== product.id)))}
                menu={menu}
                setMenu={setMenu}
                start={start}
                confirm={confirm}
                push={push}
                router={router}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {items.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            mixed={mixed}
            reorderable={reorderable}
            menu={menu}
            setMenu={setMenu}
            start={start}
            confirm={confirm}
            push={push}
            router={router}
          />
        ))}
      </div>
    </>
  );
}

function ProductRow(props: {
  product: AdminProduct;
  mixed: boolean;
  reorderable: boolean;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  menu: string | null;
  setMenu: (id: string | null) => void;
  start: (fn: () => Promise<void>) => void;
  confirm: (opts: { title: string; body: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  push: (message: string, kind?: "success" | "error" | "info") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const sortable = useSortable({ id: props.product.id, disabled: !props.reorderable });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition ?? undefined,
  };
  const cover = props.product.coverImage || props.product.images[0];
  return (
    <tr ref={sortable.setNodeRef} style={style} className="border-t border-[var(--admin-border)]">
      <td className="px-3 py-3">
        <input type="checkbox" checked={props.selected} onChange={(event) => props.onToggle(event.target.checked)} aria-label={props.product.name} />
      </td>
      {props.reorderable ? (
        <td className="px-1 py-3">
          <button type="button" className="grid h-9 w-9 cursor-grab place-items-center text-[var(--admin-muted)]" aria-label="Sırala" {...sortable.attributes} {...sortable.listeners}>
            <DotsSixVertical size={16} />
          </button>
        </td>
      ) : null}
      <td className="px-3 py-3">
        <div className="relative h-11 w-14 overflow-hidden rounded bg-[var(--admin-bg-2)]">
          {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="56px" /> : null}
        </div>
      </td>
      <td className="px-3 py-3">
        <Link href={`/admin/products/${props.product.id}`} className="font-medium hover:text-[var(--admin-accent-2)]">
          {props.product.name}
        </Link>
        <p className="text-xs text-[var(--admin-muted)]">
          {props.mixed ? (props.product.category === Category.TRACTOR ? "Traktör" : "Makine") : props.product.slug}
        </p>
      </td>
      <td className="px-3 py-3 text-[var(--admin-text-2)]">
        <p>{props.product.series || "—"}</p>
        <p className="text-xs text-[var(--admin-muted)]">{props.product.subcategory || "—"}</p>
      </td>
      <td className="px-3 py-3">
        <Status status={props.product.status} />
      </td>
      <td className="px-3 py-3 text-[var(--admin-muted)]">{new Date(props.product.updatedAt).toLocaleDateString("tr-TR")}</td>
      <td className="relative px-3 py-3 text-right">
        <RowMenu product={props.product} menu={props.menu} setMenu={props.setMenu} start={props.start} confirm={props.confirm} push={props.push} router={props.router} />
      </td>
    </tr>
  );
}

function ProductCard(props: {
  product: AdminProduct;
  mixed: boolean;
  reorderable: boolean;
  menu: string | null;
  setMenu: (id: string | null) => void;
  start: (fn: () => Promise<void>) => void;
  confirm: (opts: { title: string; body: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  push: (message: string, kind?: "success" | "error" | "info") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const sortable = useSortable({ id: props.product.id, disabled: !props.reorderable });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition ?? undefined,
  };
  const cover = props.product.coverImage || props.product.images[0];
  return (
    <article ref={sortable.setNodeRef} style={style} className="admin-panel relative overflow-visible">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[10px] bg-[var(--admin-bg-2)]">
        {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="300px" /> : null}
      </div>
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        {props.reorderable ? (
          <button type="button" className="admin-btn admin-btn-ghost min-h-8 bg-white/90 px-2" aria-label="Sırala" {...sortable.attributes} {...sortable.listeners}>
            <DotsSixVertical size={16} />
          </button>
        ) : null}
        <RowMenu product={props.product} menu={props.menu} setMenu={props.setMenu} start={props.start} confirm={props.confirm} push={props.push} router={props.router} />
      </div>
      <div className="p-3">
        <Link href={`/admin/products/${props.product.id}`} className="font-medium hover:text-[var(--admin-accent-2)]">
          {props.product.name}
        </Link>
        <p className="text-xs text-[var(--admin-muted)]">
          {props.mixed ? (props.product.category === Category.TRACTOR ? "Traktör" : "Makine") : props.product.series}
          {props.product.subcategory ? ` · ${props.product.subcategory}` : ""}
        </p>
        <p className="mt-1 text-xs">
          <Status status={props.product.status} />
        </p>
      </div>
    </article>
  );
}

function MobileProductCard(props: {
  product: AdminProduct;
  mixed: boolean;
  reorderable: boolean;
  menu: string | null;
  setMenu: (id: string | null) => void;
  start: (fn: () => Promise<void>) => void;
  confirm: (opts: { title: string; body: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  push: (message: string, kind?: "success" | "error" | "info") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const sortable = useSortable({ id: props.product.id, disabled: !props.reorderable });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition ?? undefined,
  };
  const cover = props.product.coverImage || props.product.images[0];
  return (
    <div ref={sortable.setNodeRef} style={style} className="admin-panel flex items-center gap-3 p-3">
      {props.reorderable ? (
        <button type="button" className="grid h-9 w-9 shrink-0 place-items-center text-[var(--admin-muted)]" aria-label="Sırala" {...sortable.attributes} {...sortable.listeners}>
          <DotsSixVertical size={16} />
        </button>
      ) : null}
      <Link href={`/admin/products/${props.product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded bg-[var(--admin-bg-2)]">
          {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="64px" /> : null}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{props.product.name}</p>
          <p className="truncate text-xs text-[var(--admin-muted)]">
            {props.mixed ? (props.product.category === Category.TRACTOR ? "Traktör" : "Makine") : props.product.series}
            {props.product.subcategory ? ` · ${props.product.subcategory}` : ""}
          </p>
          <p className="mt-0.5 text-xs">
            <Status status={props.product.status} />
          </p>
        </div>
      </Link>
      <div className="relative shrink-0">
        <RowMenu product={props.product} menu={props.menu} setMenu={props.setMenu} start={props.start} confirm={props.confirm} push={props.push} router={props.router} />
      </div>
    </div>
  );
}

function Status({ status }: { status: ProductStatus }) {
  const map = {
    PUBLISHED: { label: "Yayında", color: "var(--admin-success)" },
    DRAFT: { label: "Taslak", color: "var(--admin-warning)" },
    ARCHIVED: { label: "Arşiv", color: "var(--admin-muted)" },
  }[status];
  return <span style={{ color: map.color }}>{map.label}</span>;
}

function RowMenu({
  product,
  menu,
  setMenu,
  start,
  confirm,
  push,
  router,
}: {
  product: AdminProduct;
  menu: string | null;
  setMenu: (id: string | null) => void;
  start: (fn: () => Promise<void>) => void;
  confirm: (opts: { title: string; body: string; confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  push: (message: string, kind?: "success" | "error" | "info") => void;
  router: ReturnType<typeof useRouter>;
}) {
  const published = product.status === ProductStatus.PUBLISHED;
  return (
    <>
      <button type="button" className="admin-btn admin-btn-ghost min-h-8 px-2" aria-label="İşlemler" onClick={() => setMenu(menu === product.id ? null : product.id)}>
        <DotsThree size={18} />
      </button>
      {menu === product.id && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-[10px] border border-[var(--admin-border)] bg-white p-1 text-left shadow-[var(--admin-shadow)]">
          <Link href={`/admin/products/${product.id}`} className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]">
            Düzenle
          </Link>
          {published ? (
            <a className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]" href={productHref(product)} target="_blank" rel="noreferrer">
              Görüntüle
            </a>
          ) : (
            <a className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]" href={`/admin/preview/product/${product.id}`} target="_blank" rel="noreferrer">
              Önizle
            </a>
          )}
          {published ? (
            <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { await bulkUpdateProducts([product.id], { status: ProductStatus.DRAFT }); push("Yayından kaldırıldı"); })}>
              Yayından Kaldır
            </button>
          ) : (
            <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { await bulkUpdateProducts([product.id], { status: ProductStatus.PUBLISHED }); push("Yayınlandı"); })}>
              Yayınla
            </button>
          )}
          <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { const id = await duplicateProduct(product.id); router.push(`/admin/products/${id}`); })}>
            Kopyala
          </button>
          <button
            className="block w-full rounded px-3 py-2 text-left text-[var(--admin-danger)] hover:bg-[var(--admin-surface-2)]"
            onClick={async () => {
              const ok = await confirm({ title: `${product.name} silinsin mi?`, body: "Bu işlem geri alınamaz.", confirmLabel: "Ürünü Sil", danger: true });
              if (!ok) return;
              await deleteProduct(product.id);
              push("Ürün silindi", "info");
            }}
          >
            Sil
          </button>
        </div>
      )}
    </>
  );
}
