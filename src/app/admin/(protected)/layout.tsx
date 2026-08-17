import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/shell/AdminShell";
import { getCurrentUser } from "@/lib/authz";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");
  return (
    <AdminShell userName={user.name} role={user.role} email={user.email}>
      {children}
    </AdminShell>
  );
}
