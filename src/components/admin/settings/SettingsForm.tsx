"use client";

import { useState, useTransition } from "react";
import { saveSiteSettings } from "@/lib/actions/settings";
import { extractMapEmbedUrl, type PublicSiteSettings } from "@/lib/site-settings";
import { useToast } from "@/components/admin/ui/Toast";

export default function SettingsForm({ initial }: { initial: PublicSiteSettings }) {
  const { push } = useToast();
  const [form, setForm] = useState(initial);
  const [pending, start] = useTransition();
  const previewUrl = extractMapEmbedUrl(form.mapEmbedUrl);

  function patch<K extends keyof PublicSiteSettings>(key: K, value: PublicSiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form
      className="grid max-w-3xl gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const result = await saveSiteSettings({
            companyName: form.companyName,
            email: form.email,
            phone: form.phone,
            location: form.location,
            mapEmbedUrl: form.mapEmbedUrl,
            website: form.website,
          });
          if (!result.ok) {
            push(result.error, "error");
            return;
          }
          push("Firma bilgileri kaydedildi");
        });
      }}
    >
      <section className="admin-panel space-y-3 p-4">
        <h2 className="font-display text-lg">Firma</h2>
        <Field label="Firma adı" value={form.companyName} onChange={(v) => patch("companyName", v)} />
        <Field label="Website" value={form.website} onChange={(v) => patch("website", v)} />
      </section>

      <section className="admin-panel space-y-3 p-4">
        <h2 className="font-display text-lg">İletişim</h2>
        <Field label="Email" type="email" value={form.email} onChange={(v) => patch("email", v)} />
        <Field label="Telefon" value={form.phone} onChange={(v) => patch("phone", v)} />
      </section>

      <section className="admin-panel space-y-3 p-4">
        <h2 className="font-display text-lg">Lokasyon</h2>
        <Field label="Lokasyon" value={form.location} onChange={(v) => patch("location", v)} />
      </section>

      <section className="admin-panel space-y-3 p-4">
        <h2 className="font-display text-lg">Harita</h2>
        <div>
          <label className="admin-label">Google Maps embed URL</label>
          <textarea
            className="admin-textarea min-h-28"
            value={form.mapEmbedUrl}
            onChange={(e) => patch("mapEmbedUrl", e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="mt-1 text-xs text-[var(--admin-muted)]">Tam iframe yerine yalnızca embed URL saklanır.</p>
        </div>
        {previewUrl ? (
          <div className="h-56 overflow-hidden rounded-[12px] border border-[var(--admin-border)]">
            <iframe title="Harita önizleme" src={previewUrl} className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : (
          <p className="text-sm text-[var(--admin-warning)]">Geçerli bir embed URL girildiğinde önizleme görünür.</p>
        )}
      </section>

      <button type="submit" className="admin-btn admin-btn-primary w-fit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input className="admin-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
