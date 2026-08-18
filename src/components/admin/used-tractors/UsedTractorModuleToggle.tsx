"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUsedTractorsEnabled } from "@/lib/actions/settings";
import { useToast } from "@/components/admin/ui/Toast";

export default function UsedTractorModuleToggle({
  enabled,
  canToggle,
}: {
  enabled: boolean;
  canToggle: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--admin-border)] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium">2. El Modülü</p>
        <p className="text-xs text-[var(--admin-muted)]">
          Kapalıyken menü ve public sayfalar gizlenir. Kayıtlı traktörler silinmez.
        </p>
      </div>
      <button
        type="button"
        disabled={!canToggle || pending}
        aria-pressed={enabled}
        onClick={() => {
          if (!canToggle) return;
          start(async () => {
            const result = await setUsedTractorsEnabled(!enabled);
            if (!result.ok) {
              push(result.error, "error");
              return;
            }
            push(enabled ? "2. el modülü kapatıldı" : "2. el modülü açıldı");
            router.refresh();
          });
        }}
        className={`relative h-8 w-14 rounded-full transition ${
          enabled ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-border-strong)]"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${enabled ? "left-7" : "left-1"}`}
        />
        <span className="sr-only">{enabled ? "Açık" : "Kapalı"}</span>
      </button>
      <span className="text-xs font-semibold tracking-wide uppercase text-[var(--admin-text-2)]">{enabled ? "Açık" : "Kapalı"}</span>
    </div>
  );
}
