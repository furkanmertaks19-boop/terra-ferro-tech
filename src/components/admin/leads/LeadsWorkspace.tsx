"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@prisma/client";
import { markLeadReadAction, updateLeadStatus, deleteLead } from "@/lib/actions/leads";
import { relativeTimeTr } from "@/lib/relative-time";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/ConfirmDialog";
import { useAdminNotifications } from "../shell/AdminNotifications";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  readAt: string | null;
  createdAt: string;
  product: { name: string; slug: string; category: "TRACTOR" | "EQUIPMENT" } | null;
  usedTractor: { id: string; brand: string; model: string; slug: string } | null;
  locale?: string;
};

const STATUS: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "Yeni" },
  { value: "CONTACTED", label: "Görüşüldü" },
  { value: "QUOTED", label: "Teklif Verildi" },
  { value: "COMPLETED", label: "Tamamlandı" },
];

function leadSubject(lead: LeadRow) {
  if (lead.usedTractor) return `${lead.usedTractor.brand} ${lead.usedTractor.model} · 2. el`;
  return lead.product?.name ?? "Genel iletişim";
}

function summary(message: string | null) {
  if (!message) return "—";
  const text = message.replace(/\s+/g, " ").trim();
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

export default function LeadsWorkspace({
  leads,
  initialOpenId,
  canDelete,
}: {
  leads: LeadRow[];
  initialOpenId?: string | null;
  canDelete: boolean;
}) {
  const { push } = useToast();
  const confirm = useConfirm();
  const { refresh } = useAdminNotifications();
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);
  const [statusOverride, setStatusOverride] = useState<LeadStatus | null>(null);
  const [pending, start] = useTransition();
  const selected = openId ? (leads.find((item) => item.id === openId) ?? null) : null;
  const open = selected ? { ...selected, status: statusOverride ?? selected.status } : null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
        setStatusOverride(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    const lead = leads.find((item) => item.id === openId);
    if (!lead || lead.readAt) return;
    let cancelled = false;
    void markLeadReadAction(openId).then(() => {
      if (cancelled) return;
      void refresh();
      router.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [openId, leads, refresh, router]);

  function openLead(lead: LeadRow) {
    setOpenId(lead.id);
    setStatusOverride(null);
  }

  function closeLead() {
    setOpenId(null);
    setStatusOverride(null);
  }

  async function removeLead(lead: LeadRow) {
    const ok = await confirm({
      title: "Teklif talebini sil",
      body: "Bu teklif talebini silmek istediğinize emin misiniz?",
      confirmLabel: "Sil",
      danger: true,
    });
    if (!ok) return;
    start(async () => {
      await deleteLead(lead.id);
      if (openId === lead.id) closeLead();
      await refresh();
      router.refresh();
      push("Teklif talebi silindi");
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--admin-text-2)]">{leads.length} talep</p>
      {leads.length === 0 ? (
        <div className="admin-panel px-6 py-16 text-center">
          <p className="font-display text-2xl">Henüz teklif talebi yok.</p>
          <p className="mt-2 text-sm text-[var(--admin-text-2)]">Public siteden gelen talepler burada listelenir.</p>
        </div>
      ) : (
        <>
          <div className="admin-panel hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wide text-[var(--admin-muted)]">
                <tr>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">Mesaj</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                  {canDelete ? <th className="px-4 py-3 text-right">İşlem</th> : null}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`cursor-pointer border-t border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)] ${
                      lead.readAt ? "" : "bg-[rgb(180_35_24/0.04)]"
                    }`}
                    onClick={() => openLead(lead)}
                  >
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        {!lead.readAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-danger)]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--admin-danger)] uppercase">
                            <span aria-hidden>●</span> Yeni
                          </span>
                        ) : null}
                        {lead.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{lead.phone}</td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{lead.email ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{leadSubject(lead)}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-[var(--admin-text-2)]">{summary(lead.message)}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{new Date(lead.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3">
                      <Status status={lead.status} />
                    </td>
                    {canDelete ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger min-h-9 px-3"
                          disabled={pending}
                          onClick={(event) => {
                            event.stopPropagation();
                            void removeLead(lead);
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {leads.map((lead) => (
              <div key={lead.id} className="admin-panel flex items-start gap-3 p-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openLead(lead)}>
                  <p className="flex items-center gap-2 font-medium">
                    {!lead.readAt ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-[var(--admin-danger)] uppercase">
                        <span aria-hidden>●</span> Yeni
                      </span>
                    ) : null}
                    {lead.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {leadSubject(lead)} · {new Date(lead.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--admin-text-2)]">{summary(lead.message)}</p>
                </button>
                {canDelete ? (
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger shrink-0 min-h-9 px-3"
                    disabled={pending}
                    onClick={() => void removeLead(lead)}
                  >
                    Sil
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-[75]">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Kapat" onClick={closeLead} />
          <aside className="absolute inset-y-0 right-0 w-[min(100vw,420px)] overflow-y-auto border-l border-[var(--admin-border)] bg-white p-5" role="dialog" aria-modal="true">
            <p className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Teklif detayı</p>
            <h2 className="mt-1 font-display text-2xl">{open.name}</h2>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">{relativeTimeTr(open.createdAt)}</p>
            {open.locale ? (
              <p className="mt-2 text-sm text-[var(--admin-text-2)]">
                Dil: {open.locale === "tr" ? "Türkçe" : open.locale === "en" ? "English" : "Shqip"}
              </p>
            ) : null}
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--admin-muted)]">Telefon</dt>
                <dd>
                  <a href={`tel:${open.phone}`} className="text-[var(--admin-accent-2)]">
                    {open.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Email</dt>
                <dd>
                  {open.email ? (
                    <a href={`mailto:${open.email}`} className="text-[var(--admin-accent-2)]">
                      {open.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Ürün</dt>
                <dd>
                  {open.usedTractor ? (
                    <Link href={`/admin/used-tractors/${open.usedTractor.id}`} className="text-[var(--admin-accent-2)]">
                      {open.usedTractor.brand} {open.usedTractor.model} · 2. el
                    </Link>
                  ) : open.product ? (
                    <Link
                      href={open.product.category === "TRACTOR" ? `/traktoret/${open.product.slug}` : `/makineri-bujqesore/${open.product.slug}`}
                      className="text-[var(--admin-accent-2)]"
                    >
                      {open.product.name}
                    </Link>
                  ) : (
                    "Genel iletişim"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Tarih</dt>
                <dd>{new Date(open.createdAt).toLocaleString("tr-TR")}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Mesaj</dt>
                <dd className="mt-1 leading-relaxed text-[var(--admin-text-2)]">{open.message ?? "—"}</dd>
              </div>
            </dl>
            <label className="admin-label mt-5">Durum</label>
            <select
              className="admin-select"
              value={open.status}
              disabled={pending}
              onChange={(e) => {
                const status = e.target.value as LeadStatus;
                start(async () => {
                  await updateLeadStatus(open.id, status);
                  setStatusOverride(status);
                  push("Durum güncellendi");
                });
              }}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button type="button" className="admin-btn admin-btn-ghost mt-5 w-full" onClick={closeLead}>
              Kapat
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

function Status({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, { label: string; color: string }> = {
    NEW: { label: "Yeni", color: "var(--admin-info)" },
    CONTACTED: { label: "Görüşüldü", color: "var(--admin-warning)" },
    QUOTED: { label: "Teklif Verildi", color: "var(--admin-accent-2)" },
    COMPLETED: { label: "Tamamlandı", color: "var(--admin-success)" },
  };
  return <span style={{ color: map[status].color }}>{map[status].label}</span>;
}
