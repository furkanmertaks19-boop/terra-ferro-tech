"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UsedTractorStatus } from "@prisma/client";
import { deleteUsedTractor, updateUsedTractorStatus } from "@/lib/actions/used-tractors";
import { useConfirm } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/Toast";
import UsedTractorModuleToggle from "./UsedTractorModuleToggle";

export type UsedTractorListItem = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  year: number | null;
  hours: number | null;
  horsePower: number | null;
  status: UsedTractorStatus;
  coverImage: string | null;
  images: string[];
  updatedAt: string;
};

const TABS: { id: "all" | UsedTractorStatus; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: UsedTractorStatus.FOR_SALE, label: "Satışta" },
  { id: UsedTractorStatus.RESERVED, label: "Rezerve" },
  { id: UsedTractorStatus.SOLD, label: "Satıldı" },
  { id: UsedTractorStatus.DRAFT, label: "Taslak" },
  { id: UsedTractorStatus.ARCHIVED, label: "Arşiv" },
];

const STATUS_LABEL: Record<UsedTractorStatus, string> = {
  FOR_SALE: "Satışta",
  RESERVED: "Rezerve",
  SOLD: "Satıldı",
  DRAFT: "Taslak",
  ARCHIVED: "Arşiv",
};

export default function UsedTractorsWorkspace({
  items,
  enabled,
  canToggle,
  canDelete,
}: {
  items: UsedTractorListItem[];
  enabled: boolean;
  canToggle: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const { push } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      if (tab !== "all" && item.status !== tab) return false;
      if (!query) return true;
      return `${item.brand} ${item.model} ${item.year ?? ""}`.toLowerCase().includes(query);
    });
  }, [items, q, tab]);

  function setStatus(id: string, status: UsedTractorStatus) {
    start(async () => {
      await updateUsedTractorStatus(id, status);
      push("Durum güncellendi");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">2. El Traktörler</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Envanteri yönetin. Public görünürlük ayrı bir anahtarla kontrol edilir.</p>
        </div>
        <Link href="/admin/used-tractors/new" className="admin-btn admin-btn-primary">
          + Yeni 2. El Traktör
        </Link>
      </div>

      <UsedTractorModuleToggle enabled={enabled} canToggle={canToggle} />

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`admin-btn min-h-9 ${tab === item.id ? "admin-btn-primary" : "admin-btn-ghost"}`}
          >
            {item.label}
            <span className="ml-1 tabular-nums opacity-70">
              ({item.id === "all" ? items.length : items.filter((row) => row.status === item.id).length})
            </span>
          </button>
        ))}
        <input
          className="admin-input ml-auto min-w-[180px] max-w-xs"
          placeholder="Marka veya model ara"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="admin-panel px-6 py-16 text-center">
          <p className="font-display text-2xl">Kayıt yok.</p>
          <Link href="/admin/used-tractors/new" className="admin-btn admin-btn-primary mt-5">
            + Ekle
          </Link>
        </div>
      ) : (
        <>
          <div className="admin-panel hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-[var(--admin-muted)]">
                <tr>
                  <th className="px-3 py-3">Görsel</th>
                  <th className="px-3 py-3">Traktör</th>
                  <th className="px-3 py-3">Yıl / Saat / HP</th>
                  <th className="px-3 py-3">Durum</th>
                  <th className="px-3 py-3">Güncelleme</th>
                  <th className="px-3 py-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const cover = item.coverImage || item.images[0];
                  return (
                    <tr key={item.id} className="border-t border-[var(--admin-border)]">
                      <td className="px-3 py-3">
                        <div className="relative h-11 w-14 overflow-hidden rounded bg-[var(--admin-bg-2)]">
                          {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="56px" /> : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/admin/used-tractors/${item.id}`} className="font-medium hover:text-[var(--admin-accent-2)]">
                          {item.brand} {item.model}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-[var(--admin-text-2)]">
                        {[item.year, item.hours != null ? `${item.hours} saat` : null, item.horsePower != null ? `${item.horsePower} HP` : null]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td className="px-3 py-3">{STATUS_LABEL[item.status]}</td>
                      <td className="px-3 py-3 text-[var(--admin-muted)]">{new Date(item.updatedAt).toLocaleDateString("tr-TR")}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <select
                            className="admin-select w-auto min-w-[120px]"
                            value={item.status}
                            disabled={pending}
                            onChange={(event) => setStatus(item.id, event.target.value as UsedTractorStatus)}
                          >
                            {Object.entries(STATUS_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <Link href={`/admin/used-tractors/${item.id}`} className="admin-btn admin-btn-ghost min-h-9 px-3">
                            Düzenle
                          </Link>
                          {canDelete ? (
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger min-h-9 px-3"
                              disabled={pending}
                              onClick={async () => {
                                const ok = await confirm({
                                  title: "2. el traktör silinsin mi?",
                                  body: "Bu işlem geri alınamaz.",
                                  confirmLabel: "Sil",
                                  danger: true,
                                });
                                if (!ok) return;
                                start(async () => {
                                  await deleteUsedTractor(item.id);
                                  push("Silindi", "info");
                                  router.refresh();
                                });
                              }}
                            >
                              Sil
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {filtered.map((item) => {
              const cover = item.coverImage || item.images[0];
              return (
                <div key={item.id} className="admin-panel flex gap-3 p-3">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-[var(--admin-bg-2)]">
                    {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="80px" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/used-tractors/${item.id}`} className="font-medium">
                      {item.brand} {item.model}
                    </Link>
                    <p className="text-xs text-[var(--admin-muted)]">{STATUS_LABEL[item.status]}</p>
                    <select
                      className="admin-select mt-2"
                      value={item.status}
                      disabled={pending}
                      onChange={(event) => setStatus(item.id, event.target.value as UsedTractorStatus)}
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
