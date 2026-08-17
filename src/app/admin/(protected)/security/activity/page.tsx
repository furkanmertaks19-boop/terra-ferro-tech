import { UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { requireUserOrRedirect } from "@/lib/authz";

export default async function SecurityActivityPage() {
  const user = await requireUserOrRedirect();
  if (user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="admin-panel p-6">
        <h1 className="font-display text-2xl">Erişim yok</h1>
      </div>
    );
  }
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, createdAt: true, action: true, userId: true, ipAddress: true, entityType: true },
  });
  return (
    <div>
      <h1 className="font-display text-3xl">Güvenlik kayıtları</h1>
      <div className="admin-panel mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] tracking-[0.12em] uppercase text-[var(--admin-muted)]">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--admin-border)]">
                <td className="px-4 py-3">{row.createdAt.toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3">{row.userId ?? "—"}</td>
                <td className="px-4 py-3">{row.action}</td>
                <td className="px-4 py-3">{row.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
