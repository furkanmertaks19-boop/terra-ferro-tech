"use client";

import { useState } from "react";
import { changeOwnPassword, updateOwnProfile } from "@/lib/actions/auth";
import type { UserRole } from "@/lib/roles";
import { roleLabel } from "@/lib/roles";
import { useToast } from "../ui/Toast";

export type ProfileUser = {
  name: string;
  email: string;
  username: string | null;
  role: UserRole;
  lastLoginAt: Date | string | null;
};

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const { push } = useToast();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");

  return (
    <div className="grid max-w-2xl gap-6">
      <section className="admin-panel p-5">
        <h2 className="font-display text-xl">Profilim</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Rol: {roleLabel(user.role)} · değiştirilemez</p>
        <form
          className="mt-4 grid gap-3"
          action={async () => {
            try {
              await updateOwnProfile({ name, username });
              push("Profil güncellendi.");
            } catch (error) {
              push(error instanceof Error ? error.message : "Kayıt başarısız", "error");
            }
          }}
        >
          <div>
            <label className="admin-label" htmlFor="name">Ad Soyad</label>
            <input id="name" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="admin-label" htmlFor="email">E-posta</label>
            <input id="email" className="admin-input" value={user.email} readOnly />
          </div>
          <div>
            <label className="admin-label" htmlFor="username">Kullanıcı adı</label>
            <input id="username" className="admin-input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          {user.lastLoginAt ? (
            <p className="text-sm text-[var(--admin-text-2)]">
              Son giriş {new Date(user.lastLoginAt).toLocaleString("tr-TR")}
            </p>
          ) : null}
          <button type="submit" className="admin-btn admin-btn-primary w-fit">Kaydet</button>
        </form>
      </section>

      <section className="admin-panel p-5">
        <h2 className="font-display text-xl">Şifremi Değiştir</h2>
        <form
          className="mt-4 grid gap-3"
          action={async (formData) => {
            const result = await changeOwnPassword({}, formData);
            if (result.error) push(result.error, "error");
          }}
        >
          <div>
            <label className="admin-label" htmlFor="currentPassword">Mevcut şifre</label>
            <input id="currentPassword" name="currentPassword" type="password" required className="admin-input" autoComplete="current-password" />
          </div>
          <div>
            <label className="admin-label" htmlFor="newPassword">Yeni şifre</label>
            <input id="newPassword" name="newPassword" type="password" required minLength={12} className="admin-input" autoComplete="new-password" />
          </div>
          <div>
            <label className="admin-label" htmlFor="confirmPassword">Yeni şifre tekrar</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required minLength={12} className="admin-input" autoComplete="new-password" />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary w-fit">Şifreyi Güncelle</button>
        </form>
      </section>
    </div>
  );
}
