"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/password";
import { writeAudit } from "@/lib/audit";
import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { findAuthUserById, updateAuthPassword } from "@/lib/auth-db";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "E-posta/kullanıcı adı veya şifre hatalı." };
  }

  const ip = clientIp(await headers());
  if (!rateLimit(`login-action:${ip}`, 20).ok) {
    return { error: "Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin." };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    const digest =
      typeof error === "object" && error && "digest" in error ? String((error as { digest?: unknown }).digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof AuthError) {
      return { error: "E-posta/kullanıcı adı veya şifre hatalı." };
    }
    console.error("[login]", error instanceof Error ? error.message : "unknown");
    return { error: "E-posta/kullanıcı adı veya şifre hatalı." };
  }
}

export async function logoutAction() {
  const user = await requireUser().catch(() => null);
  if (user) await writeAudit({ userId: user.id, action: "LOGOUT" });
  await signOut({ redirectTo: "/admin/login" });
}

export type PasswordChangeState = { ok?: boolean; error?: string };

export async function changeOwnPassword(
  _prev: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (nextPassword !== confirm) return { error: "Yeni şifreler eşleşmiyor." };
  const policy = passwordPolicyError(nextPassword, [user.email, user.username ?? "", user.name]);
  if (policy) return { error: policy };

  const row = await findAuthUserById(user.id);
  if (!row || !(await verifyPassword(currentPassword, row.passwordHash))) {
    return { error: "Mevcut şifre hatalı." };
  }

  await updateAuthPassword(user.id, await hashPassword(nextPassword));
  await writeAudit({ userId: user.id, action: "PASSWORD_CHANGE", entityType: "User", entityId: user.id });
  await signIn("credentials", {
    username: user.email,
    password: nextPassword,
    redirectTo: "/admin",
  });
  return { ok: true };
}

export async function updateOwnProfile(input: { name: string; username: string }) {
  const user = await requireUser();
  const name = input.name.trim();
  const username = input.username.trim() || null;
  if (name.length < 2) throw new Error("Ad soyad gerekli.");
  if (username) {
    const taken = await prisma.user.findFirst({
      where: { username, NOT: { id: user.id } },
      select: { id: true },
    });
    if (taken) throw new Error("Bu kullanıcı adı kullanılıyor.");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { name, username },
  });
  await writeAudit({ userId: user.id, action: "USER_UPDATE", entityType: "User", entityId: user.id, metadata: { self: true } });
  return { ok: true as const };
}
