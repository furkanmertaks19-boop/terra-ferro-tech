"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/roles";
import { SUPER_ROLES } from "@/lib/roles";
import {
  SquaresFour,
  Package,
  ChatCircleDots,
  Slideshow,
  Buildings,
  CaretLeft,
  CaretRight,
  Newspaper,
  House,
  TreeStructure,
  Images,
  Users,
  ShieldCheck,
} from "@phosphor-icons/react";

const NAV = [
  {
    section: "Genel",
    items: [{ href: "/admin", label: "Panel", icon: SquaresFour, exact: true }],
  },
  {
    section: "Ürün Yönetimi",
    items: [
      { href: "/admin/products", label: "Ürünler", icon: Package },
      { href: "/admin/categories", label: "Kategoriler", icon: TreeStructure },
      { href: "/admin/leads", label: "Teklif Talepleri", icon: ChatCircleDots },
    ],
  },
  {
    section: "İçerik",
    items: [
      { href: "/admin/homepage", label: "Ana Sayfa", icon: House },
      { href: "/admin/pages", label: "Sayfalar", icon: Newspaper },
      { href: "/admin/sliders", label: "Slider Yönetimi", icon: Slideshow },
      { href: "/admin/gallery", label: "Galeri", icon: Images },
    ],
  },
  {
    section: "Sistem",
    items: [
      { href: "/admin/settings", label: "Firma Bilgileri", icon: Buildings },
      { href: "/admin/users", label: "Kullanıcı Yönetimi", icon: Users, roles: SUPER_ROLES },
      { href: "/admin/security", label: "Güvenlik", icon: ShieldCheck, roles: SUPER_ROLES },
    ],
  },
] as const;

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onClose,
  role,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onClose: () => void;
  role: UserRole;
}) {
  const pathname = usePathname();
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !("roles" in item) || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  const body = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center px-2" : ""}`}>
        <Image src="/logo.png" alt="Terra Ferro Tech" width={40} height={40} className="h-10 w-10 object-contain" />
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-wide">Terra Ferro Tech</p>
            <p className="text-[11px] text-[var(--admin-muted)]">Management Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 px-2">
        {groups.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-[var(--admin-muted)]">
                {group.section}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-[rgb(216_169_54/0.16)] text-[var(--admin-accent-2)]"
                          : "text-[var(--admin-text-2)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)]"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      <Icon size={18} />
                      {!collapsed && item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="m-3 hidden min-h-10 items-center justify-center rounded-[8px] border border-[var(--admin-border)] text-[var(--admin-text-2)] lg:flex"
        aria-label={collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt"}
      >
        {collapsed ? <CaretRight size={16} /> : <CaretLeft size={16} />}
      </button>
    </div>
  );

  return (
    <>
      <aside
        className={`admin-glass sticky top-0 hidden h-dvh shrink-0 lg:block ${collapsed ? "w-[76px]" : "w-[272px]"}`}
        style={{ transition: "width 220ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        {body}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Menüyü kapat" onClick={onClose} />
          <aside className="admin-glass relative h-full w-[272px]">{body}</aside>
        </div>
      )}
    </>
  );
}
