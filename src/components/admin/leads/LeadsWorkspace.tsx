"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LeadStatus } from "@prisma/client";
import { updateLeadStatus } from "@/lib/actions/leads";
import { useToast } from "../ui/Toast";

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
  product: { name: string; slug: string; category: "TRACTOR" | "EQUIPMENT" } | null;
};

const STATUS: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "Yeni" },
  { value: "CONTACTED", label: "Görüşüldü" },
  { value: "QUOTED", label: "Teklif Verildi" },
  { value: "COMPLETED", label: "Tamamlandı" },
];

export default function LeadsWorkspace({ leads }: { leads: LeadRow[] }) {
  const { push } = useToast();
  const [open, setOpen] = useState<LeadRow | null>(null);
  const [pending, start] = useTransition();

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
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="cursor-pointer border-t border-[var(--admin-border)] hover:bg-[var(--admin-surface-2)]" onClick={() => setOpen(lead)}>
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{lead.phone}</td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{lead.email ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--admin-text-2)]">{lead.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--admin-muted)]">{new Date(lead.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3"><Status status={lead.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 md:hidden">
            {leads.map((lead) => (
              <button key={lead.id} type="button" className="admin-panel w-full p-3 text-left" onClick={() => setOpen(lead)}>
                <p className="font-medium">{lead.name}</p>
                <p className="text-xs text-[var(--admin-muted)]">{lead.product?.name ?? "Genel"} · {new Date(lead.createdAt).toLocaleDateString("tr-TR")}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-[75]">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label="Kapat" onClick={() => setOpen(null)} />
          <aside className="admin-glass absolute inset-y-0 right-0 w-[min(100vw,420px)] overflow-y-auto p-5" role="dialog" aria-modal="true">
            <p className="text-xs uppercase tracking-wide text-[var(--admin-muted)]">Teklif detayı</p>
            <h2 className="mt-1 font-display text-2xl">{open.name}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--admin-muted)]">Telefon</dt>
                <dd><a href={`tel:${open.phone}`} className="text-[var(--admin-accent-2)]">{open.phone}</a></dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Email</dt>
                <dd>{open.email ? <a href={`mailto:${open.email}`} className="text-[var(--admin-accent-2)]">{open.email}</a> : "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-muted)]">Ürün</dt>
                <dd>
                  {open.product ? (
                    <Link href={open.product.category === "TRACTOR" ? `/traktoret/${open.product.slug}` : `/makineri-bujqesore/${open.product.slug}`} className="text-[var(--admin-accent-2)]">
                      {open.product.name}
                    </Link>
                  ) : "—"}
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
                  setOpen({ ...open, status });
                  push("Durum güncellendi");
                });
              }}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button type="button" className="admin-btn admin-btn-ghost mt-5 w-full" onClick={() => setOpen(null)}>Kapat</button>
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
