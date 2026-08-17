"use client";

import { useState } from "react";
import { setForcedPassword } from "@/lib/actions/users";

export default function ForcePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await setForcedPassword(formData);
      if (result && "error" in result && result.error) setError(result.error);
    } catch (error) {
      const digest =
        typeof error === "object" && error && "digest" in error ? String((error as { digest?: unknown }).digest) : "";
      if (digest.startsWith("NEXT_REDIRECT")) throw error;
      setError("Şifre güncellenemedi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-app flex min-h-dvh items-center justify-center px-4">
      <form action={onSubmit} className="admin-glass w-full max-w-md rounded-[14px] p-6">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--admin-muted)]">Güvenlik</p>
        <h1 className="mt-2 font-display text-2xl">Yeni Şifre Belirle</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">
          İlk girişte veya sıfırlama sonrası yeni bir şifre belirlemeniz gerekiyor. En az 12 karakter kullanın.
        </p>
        <label className="admin-label mt-5" htmlFor="newPassword">Yeni şifre</label>
        <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={12} className="admin-input" />
        <label className="admin-label mt-3" htmlFor="confirmPassword">Yeni şifre tekrar</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} className="admin-input" />
        {error ? <p className="mt-3 text-sm text-[var(--admin-danger)]" role="alert">{error}</p> : null}
        <button type="submit" disabled={pending} className="admin-btn admin-btn-primary mt-5 w-full">
          {pending ? "Kaydediliyor…" : "Şifreyi Kaydet"}
        </button>
      </form>
    </div>
  );
}
