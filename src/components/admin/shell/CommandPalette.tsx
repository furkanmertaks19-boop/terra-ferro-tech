"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { UserRole } from "@/lib/roles";
import { SUPER_ROLES } from "@/lib/roles";

type Hit = { name: string; href: string; hint?: string; superOnly?: boolean };

const STATIC: Hit[] = [
  { name: "Panel", href: "/admin", hint: "Genel bakış" },
  { name: "Ürünler", href: "/admin/products", hint: "Katalog" },
  { name: "Yeni ürün", href: "/admin/products/new", hint: "Oluştur" },
  { name: "Yeni traktör", href: "/admin/products/new?category=TRACTOR", hint: "Oluştur" },
  { name: "Yeni tarım makinesi", href: "/admin/products/new?category=EQUIPMENT", hint: "Oluştur" },
  { name: "Teklif talepleri", href: "/admin/leads", hint: "CRM" },
  { name: "Traktörleri göster", href: "/admin/products?category=TRACTOR" },
  { name: "Tarım makinelerini göster", href: "/admin/products?category=EQUIPMENT" },
  { name: "Slider Yönetimi", href: "/admin/sliders", hint: "İçerik" },
  { name: "Yeni slide", href: "/admin/sliders/new", hint: "İçerik" },
  { name: "Sayfalar", href: "/admin/pages", hint: "İçerik" },
  { name: "Ana Sayfa", href: "/admin/homepage", hint: "İçerik" },
  { name: "Galeri", href: "/admin/gallery", hint: "İçerik" },
  { name: "Kategoriler", href: "/admin/categories", hint: "Ürün" },
  { name: "Firma Bilgileri", href: "/admin/settings", hint: "Sistem" },
  { name: "Kullanıcı Yönetimi", href: "/admin/users", hint: "Sistem", superOnly: true },
  { name: "Güvenlik", href: "/admin/security", hint: "Sistem", superOnly: true },
  { name: "Profilim", href: "/admin/profile", hint: "Hesap" },
];

export default function CommandPalette({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: UserRole;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<Hit[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || q.trim().length < 2) return;
    const t = window.setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { results: { name: string; id: string }[] };
      setRemote(data.results.map((p) => ({ name: p.name, href: `/admin/products/${p.id}`, hint: "Ürün" })));
    }, 180);
    return () => window.clearTimeout(t);
  }, [q, open]);

  const items = useMemo(() => {
    const n = q.trim().toLowerCase();
    const local = (n ? STATIC.filter((s) => s.name.toLowerCase().includes(n)) : STATIC).filter(
      (item) => !item.superOnly || SUPER_ROLES.includes(role)
    );
    const remoteHits = n.length < 2 ? [] : remote;
    return [...remoteHits, ...local].slice(0, 10);
  }, [q, remote, role]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={onClose} />
      <div className="admin-glass relative mx-auto mt-[12vh] w-[min(92vw,560px)] overflow-hidden rounded-[14px]">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] px-4">
          <MagnifyingGlass size={16} className="text-[var(--admin-muted)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ürün ara, sayfaya git..."
            className="h-12 w-full bg-transparent text-sm text-[var(--admin-text)] outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.map((item) => (
            <li key={item.href + item.name}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left text-sm hover:bg-[var(--admin-surface-2)]"
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
              >
                <span>{item.name}</span>
                {item.hint && <span className="text-xs text-[var(--admin-muted)]">{item.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
