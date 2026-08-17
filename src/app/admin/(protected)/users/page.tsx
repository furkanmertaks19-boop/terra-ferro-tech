import { UserRole } from "@/lib/roles";
import { requireUserOrRedirect } from "@/lib/authz";
import { listUsers } from "@/lib/actions/users";
import UsersWorkspace from "@/components/admin/users/UsersWorkspace";

export default async function UsersPage() {
  const user = await requireUserOrRedirect();
  if (user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="admin-panel p-6">
        <h1 className="font-display text-2xl">Erişim yok</h1>
        <p className="mt-2 text-sm text-[var(--admin-text-2)]">Kullanıcı yönetimi yalnız Super Admin içindir.</p>
      </div>
    );
  }
  const users = await listUsers();
  return <UsersWorkspace users={users} />;
}
