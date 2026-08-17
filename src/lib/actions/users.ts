"use server";

import { UserRole, isUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, type SafeUser } from "@/lib/authz";
import { generateTemporaryPassword, hashPassword, passwordPolicyError } from "@/lib/password";
import { writeAudit } from "@/lib/audit";
import { plainText } from "@/lib/sanitize";
import { updateAuthPassword } from "@/lib/auth-db";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  lockedUntil: true,
} as const;

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lockedUntil: Date | null;
};

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  username: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  password: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
  mustChangePassword: z.boolean(),
});

async function countActiveSuperAdmins() {
  return prisma.user.count({ where: { role: UserRole.SUPER_ADMIN, isActive: true } });
}

function revalidateUsers() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/security");
  revalidatePath("/admin/security/activity");
}

export async function listUsers(): Promise<AdminUserRow[]> {
  await requireSuperAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: USER_SELECT,
  });
}

export async function createUser(input: z.infer<typeof createSchema>) {
  const actor = await requireSuperAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  if (parsed.data.password !== parsed.data.confirmPassword) return { ok: false as const, error: "Şifreler eşleşmiyor." };
  const policy = passwordPolicyError(parsed.data.password, [parsed.data.email, parsed.data.username ?? "", parsed.data.name]);
  if (policy) return { ok: false as const, error: policy };

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username?.trim() || null;
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
    select: { id: true },
  });
  if (exists) return { ok: false as const, error: "Bu e-posta veya kullanıcı adı zaten kayıtlı." };

  const row = await prisma.user.create({
    data: {
      name: plainText(parsed.data.name, 80),
      email,
      username,
      role: parsed.data.role,
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: parsed.data.mustChangePassword,
      passwordChangedAt: new Date(),
    },
    select: USER_SELECT,
  });
  await writeAudit({
    userId: actor.id,
    action: "USER_CREATE",
    entityType: "User",
    entityId: row.id,
    metadata: { role: row.role, email: row.email },
  });
  revalidateUsers();
  return { ok: true as const, user: row };
}

export async function updateUserRole(id: string, role: UserRole) {
  const actor = await requireSuperAdmin();
  if (!isUserRole(role)) return { ok: false as const, error: "Geçersiz rol." };
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) return { ok: false as const, error: "Kullanıcı bulunamadı." };
  if (target.id === actor.id && role !== UserRole.SUPER_ADMIN) {
    const supers = await countActiveSuperAdmins();
    if (supers <= 1) return { ok: false as const, error: "Son Super Admin rolünü düşüremezsiniz." };
  }
  await prisma.user.update({ where: { id }, data: { role } });
  await writeAudit({
    userId: actor.id,
    action: "ROLE_CHANGE",
    entityType: "User",
    entityId: id,
    metadata: { from: target.role, to: role },
  });
  revalidateUsers();
  return { ok: true as const };
}

export async function setUserActive(id: string, isActive: boolean) {
  const actor = await requireSuperAdmin();
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) return { ok: false as const, error: "Kullanıcı bulunamadı." };
  if (!isActive && target.role === UserRole.SUPER_ADMIN) {
    const supers = await countActiveSuperAdmins();
    if (supers <= 1 && target.isActive) return { ok: false as const, error: "Son Super Admin pasifleştirilemez." };
  }
  await prisma.user.update({
    where: { id },
    data: isActive ? { isActive: true, lockedUntil: null, failedLoginAttempts: 0 } : { isActive: false, sessionVersion: { increment: 1 } },
  });
  await writeAudit({
    userId: actor.id,
    action: isActive ? "USER_UPDATE" : "USER_DISABLE",
    entityType: "User",
    entityId: id,
  });
  revalidateUsers();
  return { ok: true as const };
}

export async function resetUserPassword(id: string) {
  const actor = await requireSuperAdmin();
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return { ok: false as const, error: "Kullanıcı bulunamadı." };
  const temporary = generateTemporaryPassword();
  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: await hashPassword(temporary),
      mustChangePassword: true,
      passwordChangedAt: new Date(),
      sessionVersion: { increment: 1 },
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  await writeAudit({ userId: actor.id, action: "PASSWORD_RESET", entityType: "User", entityId: id });
  revalidateUsers();
  return { ok: true as const, temporaryPassword: temporary };
}

export async function revokeUserSessions(id: string) {
  const actor = await requireSuperAdmin();
  await prisma.user.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
  await writeAudit({ userId: actor.id, action: "SESSION_REVOKE", entityType: "User", entityId: id });
  revalidateUsers();
  return { ok: true as const };
}

export async function setForcedPassword(formData: FormData) {
  const { requireUser } = await import("@/lib/authz");
  const user = await requireUser();
  if (!user.mustChangePassword) return { ok: false as const, error: "Şifre değişimi zorunlu değil." };
  const password = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password !== confirm) return { ok: false as const, error: "Şifreler eşleşmiyor." };
  const policy = passwordPolicyError(password, [user.email, user.username ?? "", user.name]);
  if (policy) return { ok: false as const, error: policy };
  await updateAuthPassword(user.id, await hashPassword(password));
  await writeAudit({ userId: user.id, action: "PASSWORD_CHANGE", entityType: "User", entityId: user.id, metadata: { forced: true } });
  const { signIn } = await import("@/auth");
  await signIn("credentials", { username: user.email, password, redirectTo: "/admin" });
  return { ok: true as const };
}

export type { SafeUser };
