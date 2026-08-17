import { UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { requireUserOrRedirect } from "@/lib/authz";
import Link from "next/link";

export default async function SecurityPage() {
  const user = await requireUserOrRedirect();
  if (user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="admin-panel p-6">
        <h1 className="font-display text-2xl">Erişim yok</h1>
        <p className="mt-2 text-sm text-[var(--admin-text-2)]">Güvenlik özeti yalnız Super Admin içindir.</p>
      </div>
    );
  }

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [failed, active, locked, passwordChanges, recent] = await Promise.all([
    prisma.auditLog.count({ where: { action: "LOGIN_FAILURE", createdAt: { gte: dayAgo } } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { lockedUntil: { gt: now } } }),
    prisma.auditLog.count({ where: { action: { in: ["PASSWORD_CHANGE", "PASSWORD_RESET"] }, createdAt: { gte: weekAgo } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 12, select: { id: true, action: true, createdAt: true, ipAddress: true, userId: true } }),
  ]);

  const cards = [
    { label: "Son 24 saatte başarısız giriş", value: failed },
    { label: "Aktif kullanıcı", value: active },
    { label: "Kilitli hesap", value: locked },
    { label: "7 günde şifre değişimi/reset", value: passwordChanges },
  ];

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Güvenlik</h1>
          <p className="mt-1 text-sm text-[var(--admin-text-2)]">Gerçek audit kayıtlarından özet.</p>
        </div>
        <Link href="/admin/security/activity" className="admin-btn admin-btn-ghost">
          Tüm kayıtlar
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="admin-panel p-4">
            <p className="text-xs text-[var(--admin-muted)]">{card.label}</p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="admin-panel mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] tracking-[0.12em] uppercase text-[var(--admin-muted)]">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((row) => (
              <tr key={row.id} className="border-t border-[var(--admin-border)]">
                <td className="px-4 py-3">{row.createdAt.toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3">{row.userId ?? "—"}</td>
                <td className="px-4 py-3">{row.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
