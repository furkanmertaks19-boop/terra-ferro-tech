"use client";

import { useState } from "react";
import {
  createUser,
  resetUserPassword,
  revokeUserSessions,
  setUserActive,
  updateUserRole,
  type AdminUserRow,
} from "@/lib/actions/users";
import { UserRole, isUserRole } from "@/lib/roles";
import { useToast } from "../ui/Toast";

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UsersWorkspace({ users }: { users: AdminUserRow[] }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function onCreate(formData: FormData) {
    setBusy(true);
    const roleRaw = String(formData.get("role") ?? "EDITOR");
    const result = await createUser({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      role: isUserRole(roleRaw) ? roleRaw : UserRole.EDITOR,
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
      mustChangePassword: formData.get("mustChangePassword") === "on",
    });
    setBusy(false);
    if (!result.ok) {
      push(result.error, "error");
      return;
    }
    setOpen(false);
    push("Kullanıcı oluşturuldu.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Kullanıcı Yönetimi</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Admin paneline erişebilen kullanıcıları yönetin.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setOpen(true)}>
          + Kullanıcı Ekle
        </button>
      </div>

      <div className="admin-panel mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.12em] uppercase text-[var(--admin-muted)]">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Son Giriş</th>
              <th className="px-4 py-3">Oluşturulma</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[var(--admin-border)]">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-[var(--admin-muted)]">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="admin-input min-h-9 py-1"
                    defaultValue={user.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      if (!isUserRole(role)) return;
                      void updateUserRole(user.id, role).then((result) => {
                        if (!result.ok) push(result.error, "error");
                        else push("Rol güncellendi.");
                      });
                    }}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                </td>
                <td className="px-4 py-3">{user.isActive ? "Aktif" : "Pasif"}</td>
                <td className="px-4 py-3 text-[var(--admin-text-2)]">{formatDate(user.lastLoginAt)}</td>
                <td className="px-4 py-3 text-[var(--admin-text-2)]">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost min-h-8 text-xs"
                      onClick={() => {
                        void setUserActive(user.id, !user.isActive).then((result) => {
                          if (!result.ok) push(result.error, "error");
                        });
                      }}
                    >
                      {user.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost min-h-8 text-xs"
                      onClick={() => {
                        void resetUserPassword(user.id).then((result) => {
                          if (!result.ok) push(result.error, "error");
                          else setTempPassword(result.temporaryPassword);
                        });
                      }}
                    >
                      Şifre Sıfırla
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost min-h-8 text-xs"
                      onClick={() => {
                        void revokeUserSessions(user.id).then((result) => {
                          if (!result.ok) return;
                          push("Oturumlar sonlandırıldı.");
                        });
                      }}
                    >
                      Oturumları Sonlandır
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Kapat" onClick={() => setOpen(false)} />
          <form action={onCreate} className="admin-glass relative w-full max-w-lg rounded-[14px] p-5" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
            <h2 id="create-user-title" className="font-display text-2xl">Kullanıcı Ekle</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <label className="admin-label" htmlFor="name">Ad Soyad</label>
                <input id="name" name="name" required className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="email">E-posta</label>
                <input id="email" name="email" type="email" required className="admin-input" autoComplete="off" />
              </div>
              <div>
                <label className="admin-label" htmlFor="username">Kullanıcı adı (opsiyonel)</label>
                <input id="username" name="username" className="admin-input" autoComplete="off" />
              </div>
              <div>
                <label className="admin-label" htmlFor="role">Rol</label>
                <select id="role" name="role" defaultValue="EDITOR" className="admin-input">
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="password">Geçici şifre</label>
                <input id="password" name="password" type="password" required minLength={12} className="admin-input" autoComplete="new-password" />
              </div>
              <div>
                <label className="admin-label" htmlFor="confirmPassword">Şifre tekrarı</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required minLength={12} className="admin-input" autoComplete="new-password" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="mustChangePassword" defaultChecked />
                İlk girişte şifre değiştirmeye zorla
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>Vazgeç</button>
              <button type="submit" disabled={busy} className="admin-btn admin-btn-primary">{busy ? "Kaydediliyor…" : "Oluştur"}</button>
            </div>
          </form>
        </div>
      ) : null}

      {tempPassword ? (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Kapat" onClick={() => setTempPassword(null)} />
          <div className="admin-glass relative w-full max-w-md rounded-[14px] p-5" role="dialog" aria-modal="true" aria-labelledby="temp-password-title">
            <h2 id="temp-password-title" className="font-display text-2xl">Geçici şifre</h2>
            <p className="mt-2 text-sm text-[var(--admin-text-2)]">Bu şifre yalnızca bir kez gösterilir. Kaydetmeyin; kullanıcıya güvenli iletin.</p>
            <p className="mt-4 break-all rounded-[8px] bg-[var(--admin-surface-2)] px-3 py-3 font-mono text-sm">{tempPassword}</p>
            <button type="button" className="admin-btn admin-btn-primary mt-4 w-full" onClick={() => setTempPassword(null)}>Anladım</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
