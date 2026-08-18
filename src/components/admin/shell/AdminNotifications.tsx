"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChatCircleDots, EnvelopeSimple } from "@phosphor-icons/react";
import { markAllLeadsReadAction } from "@/lib/actions/leads";
import { relativeTimeTr } from "@/lib/relative-time";
import type { LeadNotification } from "@/lib/leads-notifications";

type NotificationsState = {
  count: number;
  items: LeadNotification[];
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

export function AdminNotificationsProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: React.ReactNode;
}) {
  const [live, setLive] = useState<{ count: number; items: LeadNotification[] } | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/notifications", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { count: number; items: LeadNotification[] };
    setLive({ count: data.count, items: data.items });
  }, []);

  useEffect(() => {
    const boot = window.setTimeout(() => {
      void refresh();
    }, 0);
    const timer = window.setInterval(() => {
      void refresh();
    }, 45_000);
    return () => {
      window.clearTimeout(boot);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return (
    <NotificationsContext.Provider value={{ count: live?.count ?? initialCount, items: live?.items ?? [], refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) {
    return {
      count: 0,
      items: [] as LeadNotification[],
      refresh: async () => undefined,
    };
  }
  return value;
}

export function UnreadLeadBadge({ collapsed = false }: { collapsed?: boolean }) {
  const { count } = useAdminNotifications();
  if (count < 1) return null;
  return (
    <span
      className={`ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--admin-danger)] px-1.5 text-[10px] font-bold text-white ${
        collapsed ? "absolute right-1 top-1 ml-0 min-h-4 min-w-4 px-1" : ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function NotificationBell() {
  const { count, items, refresh } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAll() {
    setPending(true);
    try {
      await markAllLeadsReadAction();
      await refresh();
      router.refresh();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="admin-btn admin-btn-ghost relative px-2.5"
        aria-label="Bildirimler"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={18} />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--admin-danger)] px-1 text-[10px] font-bold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Bildirimler"
          className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-1.5rem),380px)] overflow-hidden rounded-[12px] border border-[var(--admin-border)] bg-white shadow-[var(--admin-shadow)] max-sm:fixed max-sm:right-3 max-sm:left-3 max-sm:w-auto"
        >
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
            <p className="text-sm font-semibold">Bildirimler</p>
            {count > 0 ? (
              <button type="button" className="text-xs font-medium text-[var(--admin-accent-2)] disabled:opacity-50" onClick={() => void markAll()} disabled={pending}>
                Tümünü okundu işaretle
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[var(--admin-text-2)]">Okunmamış bildirim yok</p>
              <Link href="/admin/leads" className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--admin-accent-2)]" onClick={() => setOpen(false)}>
                Teklif taleplerini görüntüle
              </Link>
            </div>
          ) : (
            <ul className="max-h-[min(70vh,420px)] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                  <Link href={item.href} className="flex gap-3 px-4 py-3 hover:bg-[var(--admin-surface-2)]" onClick={() => setOpen(false)}>
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--admin-surface-2)] text-[var(--admin-accent-2)]">
                      {item.productName ? <ChatCircleDots size={16} /> : <EnvelopeSimple size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--admin-text)]">
                          {item.productName ? "Yeni teklif talebi" : "Yeni genel iletişim talebi"}
                        </span>
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-danger)]" aria-hidden />
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-[var(--admin-text-2)]">
                        {item.productName ? `${item.productName} için teklif talebi` : item.name}
                      </span>
                      <span className="mt-1 block text-[11px] text-[var(--admin-muted)]">{relativeTimeTr(item.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 ? (
            <div className="border-t border-[var(--admin-border)] px-4 py-3">
              <Link href="/admin/leads" className="text-sm font-semibold text-[var(--admin-accent-2)]" onClick={() => setOpen(false)}>
                Teklif taleplerini görüntüle
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
