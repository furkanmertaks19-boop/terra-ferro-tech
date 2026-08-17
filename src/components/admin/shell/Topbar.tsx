"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { logoutAction } from "@/lib/actions/auth";

const TITLES: Record<string, string> = {
  "/admin": "Panel",
  "/admin/products": "Ürünler",
  "/admin/products/new": "Yeni Ürün",
  "/admin/leads": "Teklif Talepleri",
  "/admin/sliders": "Slider Yönetimi",
  "/admin/sliders/new": "Yeni Slide",
  "/admin/gallery": "Galeri",
  "/admin/settings": "Firma Bilgileri",
  "/admin/users": "Kullanıcı Yönetimi",
  "/admin/security": "Güvenlik",
  "/admin/security/activity": "Güvenlik kayıtları",
  "/admin/profile": "Profilim",
  "/admin/homepage": "Ana Sayfa",
  "/admin/pages": "Sayfalar",
  "/admin/categories": "Kategoriler",
  "/admin/category-pages": "Sayfalar",
};

export default function Topbar({
  userName,
  roleLabel,
  onMenu,
  onSearch,
}: {
  userName: string;
  roleLabel: string;
  onMenu: () => void;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/admin/products/") ? "Ürün Düzenle" : pathname.startsWith("/admin/sliders/") ? "Slide Düzenle" : pathname.startsWith("/admin/pages/") ? "Sayfa Düzenle" : "Yönetim");

  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((part, i, arr) => {
      const href = "/" + arr.slice(0, i + 1).join("/");
      const label = TITLES[href] ?? (part === "admin" ? "Genel Bakış" : decodeURIComponent(part));
      return { href, label };
    });

  return (
    <header className="admin-glass sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 px-4 py-3 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="admin-btn admin-btn-ghost lg:hidden" onClick={onMenu} aria-label="Menüyü aç">
          <List size={18} />
        </button>
        <div className="min-w-0">
          <nav className="hidden text-[11px] text-[var(--admin-muted)] md:flex" aria-label="Konum">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center">
                {i > 0 && <span className="mx-1.5">/</span>}
                <Link href={c.href} className="hover:text-[var(--admin-text)]">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
          <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="admin-btn admin-btn-ghost hidden sm:inline-flex" onClick={onSearch}>
          <MagnifyingGlass size={16} />
          Ara
          <span className="admin-kbd">⌘K</span>
        </button>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => router.push("/admin/products/new")}>
          <Plus size={16} />
          <span className="hidden sm:inline">Hızlı Ekle</span>
        </button>
        <div className="relative group">
          <button type="button" className="admin-btn admin-btn-ghost text-left" aria-haspopup="menu" aria-label="Hesap menüsü">
            <span className="block text-sm leading-tight">{userName}</span>
            <span className="block text-[10px] text-[var(--admin-muted)]">{roleLabel}</span>
          </button>
          <div
            role="menu"
            className="absolute right-0 z-50 hidden min-w-44 rounded-[10px] border border-[var(--admin-border)] bg-[var(--admin-surface)] py-1 shadow-lg group-hover:block group-focus-within:block"
          >
            <Link href="/admin/profile" className="block px-3 py-2 text-sm hover:bg-[var(--admin-surface-2)]">
              Profilim
            </Link>
            <Link href="/admin/profile" className="block px-3 py-2 text-sm hover:bg-[var(--admin-surface-2)]">
              Şifremi Değiştir
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--admin-surface-2)]">
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
