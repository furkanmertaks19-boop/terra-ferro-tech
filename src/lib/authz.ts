import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { findAuthUserById, type AuthUserRow } from "@/lib/auth-db";
import { ADMIN_ROLES, CONTENT_ROLES, SUPER_ROLES, type UserRole } from "@/lib/roles";

export { ADMIN_ROLES, CONTENT_ROLES, SUPER_ROLES, canPublish, roleLabel } from "@/lib/roles";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export type SafeUser = Omit<AuthUserRow, "passwordHash">;

function withoutSecret(user: AuthUserRow): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  void _passwordHash;
  return safe;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await findAuthUserById(id);
  if (!user || !user.isActive) return null;
  if (session.user.sessionVersion !== user.sessionVersion) return null;
  return withoutSecret(user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Yetkisiz erişim", 401);
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<SafeUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new AuthError("Bu işlem için yetkiniz yok.", 403);
  return user;
}

export async function requireContentAccess() {
  return requireRole(CONTENT_ROLES);
}

export async function requireAdminAccess() {
  return requireRole(ADMIN_ROLES);
}

export async function requireSuperAdmin() {
  return requireRole(SUPER_ROLES);
}

export async function requireUserOrRedirect(path = "/admin/login"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(path);
  return user;
}
