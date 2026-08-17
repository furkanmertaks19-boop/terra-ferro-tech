"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DotsThree, Funnel, SquaresFour, Table, X } from "@phosphor-icons/react";
import type { AdminProduct } from "@/lib/types";
import { TEMPLATE_CATALOG } from "@/lib/templates";
import { Category, ProductStatus } from "@prisma/client";
import { productHref } from "@/lib/product-path";
import { bulkDeleteProducts, bulkUpdateProducts, deleteProduct, duplicateProduct } from "@/lib/actions/products";
import { useConfirm } from "../ui/ConfirmDialog";
import { useToast } from "../ui/Toast";

export default function ProductsWorkspace({
  products,
  query,
  seriesOptions,
  subcategoryOptions,
}: {
  products: AdminProduct[];
  query: Record<string, string>;
  seriesOptions: string[];
  subcategoryOptions: string[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const { push } = useToast();
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(query);
  const [pending, start] = useTransition();
  const allIds = products.map((p) => p.id);
  const activeFilterCount = ["category", "status", "series", "subcategory", "template", "featured"].filter((key) => query[key]).length;

  function setChip(key: string, value: string) {
    const next = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v && k !== "price") next.set(k, v);
    });
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`/admin/products?${next.toString()}`);
  }

  function applyFilters() {
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([k, v]) => {
      if (v && k !== "price") next.set(k, v);
    });
    router.push(`/admin/products?${next.toString()}`);
    setFiltersOpen(false);
  }

  function clearFilters() {
    const q = draft.q ? `q=${encodeURIComponent(draft.q)}` : "";
    router.push(q ? `/admin/products?${q}` : "/admin/products");
    setDraft({ q: draft.q ?? "", category: "", status: "", template: "", featured: "", series: "", subcategory: "" });
    setFiltersOpen(false);
  }

  const chips = useMemo(
    () => [
      { key: "all", label: "Tümü", active: !query.category && !query.status },
      { key: "TRACTOR", label: "Traktörler", active: query.category === Category.TRACTOR && query.status !== ProductStatus.DRAFT },
      { key: "EQUIPMENT", label: "Tarım Makineleri", active: query.category === Category.EQUIPMENT },
      { key: "DRAFT", label: "Taslaklar", active: query.status === ProductStatus.DRAFT },
      { key: "ARCHIVED", label: "Arşiv", active: query.status === ProductStatus.ARCHIVED },
    ],
    [query.category, query.status]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Ürünler</h1>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + Yeni Ürün
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          className="admin-input max-w-xs"
          placeholder="Ürün ara..."
          defaultValue={query.q}
          onKeyDown={(e) => {
            if (e.key === "Enter") setChip("q", (e.target as HTMLInputElement).value.trim());
          }}
        />
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { setDraft(query); setFiltersOpen(true); }}>
          <Funnel size={16} /> Filtreler{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={`admin-btn min-h-9 px-3 text-sm ${chip.active ? "admin-btn-primary" : "admin-btn-ghost"}`}
            onClick={() => {
              if (chip.key === "all") router.push("/admin/products");
              else if (chip.key === "DRAFT") setChip("status", ProductStatus.DRAFT);
              else if (chip.key === "ARCHIVED") setChip("status", ProductStatus.ARCHIVED);
              else setChip("category", chip.key);
            }}
          >
            {chip.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button type="button" className={`admin-btn ${view === "table" ? "admin-btn-primary" : "admin-btn-ghost"}`} onClick={() => setView("table")}>
            <Table size={16} />
          </button>
          <button type="button" className={`admin-btn ${view === "grid" ? "admin-btn-primary" : "admin-btn-ghost"}`} onClick={() => setView("grid")}>
            <SquaresFour size={16} />
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--admin-text-2)]">{products.length} ürün</p>

      {selected.length > 0 && (
        <div className="admin-glass flex flex-wrap items-center gap-2 rounded-[10px] px-3 py-2 text-sm">
          <span>{selected.length} seçili</span>
          <button className="admin-btn admin-btn-ghost" disabled={pending} onClick={() => start(async () => { await bulkUpdateProducts(selected, { status: ProductStatus.PUBLISHED }); push("Ürünler yayına alındı"); })}>Yayına al</button>
          <button className="admin-btn admin-btn-ghost" disabled={pending} onClick={() => start(async () => { await bulkUpdateProducts(selected, { status: ProductStatus.ARCHIVED }); push("Arşivlendi"); })}>Arşivle</button>
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

      {products.length === 0 ? (
        <div className="admin-panel px-6 py-16 text-center">
          <p className="font-display text-2xl">Henüz ürün yok.</p>
          <Link href="/admin/products/new" className="admin-btn admin-btn-primary mt-5">+ Ürün Ekle</Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => {
            const cover = p.coverImage || p.images[0];
            return (
              <article key={p.id} className="admin-panel relative overflow-visible">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-[10px] bg-[var(--admin-bg-3)]">
                  {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="300px" /> : null}
                </div>
                <div className="absolute right-2 top-2 z-10">
                  <RowMenu product={p} menu={menu} setMenu={setMenu} start={start} confirm={confirm} push={push} router={router} />
                </div>
                <div className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-[var(--admin-accent-2)]">{p.name}</Link>
                  <p className="text-xs text-[var(--admin-muted)]">{p.category === "TRACTOR" ? "Traktör" : "Makine"}</p>
                  <p className="mt-1 text-xs"><Status status={p.status} /></p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-panel hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-[var(--admin-muted)]">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox" checked={selected.length === allIds.length} onChange={(e) => setSelected(e.target.checked ? allIds : [])} aria-label="Tümünü seç" />
                </th>
                <th className="px-3 py-3">Ürün</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Seri</th>
                <th className="px-3 py-3">Durum</th>
                <th className="px-3 py-3">Güncelleme</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = p.coverImage || p.images[0];
                return (
                  <tr key={p.id} className="border-t border-[var(--admin-border)]">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected((s) => e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id))} aria-label={p.name} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-14 overflow-hidden rounded bg-[var(--admin-bg-3)]">
                          {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="56px" /> : null}
                        </div>
                        <div>
                          <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-[var(--admin-accent-2)]">{p.name}</Link>
                          <p className="text-xs text-[var(--admin-muted)]">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[var(--admin-text-2)]">{p.category === "TRACTOR" ? "Traktör" : "Makine"}</td>
                    <td className="px-3 py-3 text-[var(--admin-text-2)]">{p.series}</td>
                    <td className="px-3 py-3"><Status status={p.status} /></td>
                    <td className="px-3 py-3 text-[var(--admin-muted)]">{new Date(p.updatedAt).toLocaleDateString("tr-TR")}</td>
                    <td className="relative px-3 py-3 text-right">
                      <RowMenu product={p} menu={menu} setMenu={setMenu} start={start} confirm={confirm} push={push} router={router} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "table" && (
        <div className="space-y-3 md:hidden">
          {products.map((p) => (
            <Link key={p.id} href={`/admin/products/${p.id}`} className="admin-panel flex items-center gap-3 p-3">
              <div className="relative h-14 w-16 overflow-hidden rounded bg-[var(--admin-bg-3)]">
                {(p.coverImage || p.images[0]) && <Image src={p.coverImage || p.images[0]} alt="" fill className="object-cover" sizes="64px" />}
              </div>
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-[var(--admin-muted)]">{p.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtersOpen && (
        <div className="fixed inset-0 z-[80]">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={() => setFiltersOpen(false)} />
          <aside className="admin-glass absolute right-0 top-0 flex h-full w-[min(92vw,380px)] flex-col">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-4">
              <p className="font-display text-xl">Filtreler</p>
              <button type="button" className="admin-btn admin-btn-ghost min-h-9 px-2" onClick={() => setFiltersOpen(false)} aria-label="Kapat">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block">
                <span className="admin-label">Kategori</span>
                <select className="admin-select" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
                  <option value="">Tümü</option>
                  <option value={Category.TRACTOR}>Traktör</option>
                  <option value={Category.EQUIPMENT}>Tarım Makinesi</option>
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Alt kategori</span>
                <select className="admin-select" value={draft.subcategory ?? ""} onChange={(e) => setDraft((d) => ({ ...d, subcategory: e.target.value }))}>
                  <option value="">Tümü</option>
                  {subcategoryOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Seri</span>
                <select className="admin-select" value={draft.series ?? ""} onChange={(e) => setDraft((d) => ({ ...d, series: e.target.value }))}>
                  <option value="">Tümü</option>
                  {seriesOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Durum</span>
                <select className="admin-select" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
                  <option value="">Tümü</option>
                  <option value={ProductStatus.PUBLISHED}>Yayında</option>
                  <option value={ProductStatus.DRAFT}>Taslak</option>
                  <option value={ProductStatus.ARCHIVED}>Arşiv</option>
                </select>
              </label>
              <label className="block">
                <span className="admin-label">Şablon</span>
                <select className="admin-select" value={draft.template} onChange={(e) => setDraft((d) => ({ ...d, template: e.target.value }))}>
                  <option value="">Tümü</option>
                  {TEMPLATE_CATALOG.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.featured === "1"} onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked ? "1" : "" }))} />
                Öne çıkan
              </label>
            </div>
            <div className="flex gap-2 border-t border-[var(--admin-border)] p-4">
              <button type="button" className="admin-btn admin-btn-ghost flex-1" onClick={clearFilters}>Filtreleri Temizle</button>
              <button type="button" className="admin-btn admin-btn-primary flex-1" onClick={applyFilters}>Uygula</button>
            </div>
          </aside>
        </div>
      )}
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
        <div className="admin-glass absolute right-0 z-20 mt-1 w-44 rounded-[10px] p-1 text-left">
          <Link href={`/admin/products/${product.id}`} className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]">Düzenle</Link>
          {published ? (
            <a className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]" href={productHref(product)} target="_blank" rel="noreferrer">Görüntüle</a>
          ) : (
            <a className="block rounded px-3 py-2 hover:bg-[var(--admin-surface-2)]" href={`/admin/preview/product/${product.id}`} target="_blank" rel="noreferrer">Önizle</a>
          )}
          {published ? (
            <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { await bulkUpdateProducts([product.id], { status: ProductStatus.DRAFT }); push("Yayından kaldırıldı"); })}>Yayından Kaldır</button>
          ) : (
            <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { await bulkUpdateProducts([product.id], { status: ProductStatus.PUBLISHED }); push("Yayınlandı"); })}>Yayınla</button>
          )}
          <button className="block w-full rounded px-3 py-2 text-left hover:bg-[var(--admin-surface-2)]" onClick={() => start(async () => { const id = await duplicateProduct(product.id); router.push(`/admin/products/${id}`); })}>Kopyala</button>
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
