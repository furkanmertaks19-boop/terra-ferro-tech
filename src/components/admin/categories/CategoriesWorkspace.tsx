"use client";

import { useState, useTransition } from "react";
import { DotsSixVertical, Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import type { CategoryTree } from "@/lib/category-types";
import {
  createProductCategory,
  deleteProductCategory,
  reorderProductCategories,
  updateProductCategory,
} from "@/lib/actions/categories";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";

export default function CategoriesWorkspace({ trees }: { trees: CategoryTree[] }) {
  const confirm = useConfirm();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState<string | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Kategoriler</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">Ürün türleri ve alt kategorileri yönetin.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {trees.map((tree) => (
          <section key={tree.root.kind} className="admin-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl">{tree.root.name}</p>
                <p className="text-xs text-[var(--admin-muted)]">{tree.root.kind === "TRACTOR" ? "Traktörler" : "Tarım Makineleri"}</p>
              </div>
              <button type="button" className="admin-btn admin-btn-ghost min-h-9" onClick={() => { setAdding(tree.root.id); setName(""); }}>
                <Plus size={14} /> Alt kategori
              </button>
            </div>
            <ul className="mt-4 space-y-1">
              {tree.children.map((child, index) => (
                <li key={child.id} className="flex items-center gap-2 rounded-[8px] px-2 py-2 hover:bg-[var(--admin-surface-2)]">
                  <span className="text-[var(--admin-muted)]"><DotsSixVertical size={16} /></span>
                  <span className="flex-1 text-sm">{child.name}</span>
                  <button
                    type="button"
                    className="text-xs text-[var(--admin-muted)]"
                    onClick={() => start(async () => { await updateProductCategory({ id: child.id, isActive: !child.isActive }); push(child.isActive ? "Pasif" : "Aktif"); })}
                  >
                    {child.isActive ? "Aktif" : "Pasif"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost min-h-8 px-2"
                    onClick={() => {
                      const next = window.prompt("Yeni isim", child.name);
                      if (!next?.trim()) return;
                      start(async () => { await updateProductCategory({ id: child.id, name: next.trim() }); push("Güncellendi"); });
                    }}
                    aria-label="Yeniden adlandır"
                  >
                    <PencilSimple size={14} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost min-h-8 px-2"
                    disabled={index === 0}
                    onClick={() => {
                      const ids = tree.children.map((c) => c.id);
                      const next = [...ids];
                      const current = next[index];
                      next[index] = next[index - 1];
                      next[index - 1] = current;
                      start(async () => { await reorderProductCategories(next); });
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost min-h-8 px-2"
                    disabled={index === tree.children.length - 1}
                    onClick={() => {
                      const ids = tree.children.map((c) => c.id);
                      const next = [...ids];
                      const current = next[index];
                      next[index] = next[index + 1];
                      next[index + 1] = current;
                      start(async () => { await reorderProductCategories(next); });
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost min-h-8 px-2 text-[var(--admin-danger)]"
                    onClick={async () => {
                      const ok = await confirm({ title: `${child.name} silinsin mi?`, body: "Ürünlerdeki alt kategori adı değişmez.", confirmLabel: "Sil", danger: true });
                      if (!ok) return;
                      start(async () => { await deleteProductCategory(child.id); push("Silindi"); });
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </li>
              ))}
            </ul>
            {adding === tree.root.id && (
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name.trim()) return;
                  start(async () => {
                    await createProductCategory({ kind: tree.root.kind, parentId: tree.root.id, name: name.trim() });
                    setAdding(null);
                    setName("");
                    push("Kategori eklendi");
                  });
                }}
              >
                <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alt kategori adı" />
                <button type="submit" className="admin-btn admin-btn-primary min-h-10" disabled={pending}>Ekle</button>
              </form>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
