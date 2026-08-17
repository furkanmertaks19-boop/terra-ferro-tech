import { prisma, withPrismaRetry } from "@/lib/prisma";
import type { UserRole } from "@/lib/roles";
import { isUserRole } from "@/lib/roles";

export type AuthUserRow = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  sessionVersion: number;
};

function mapUser(user: {
  id: string;
  name: string;
  email: string;
  username: string | null;
  passwordHash: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  sessionVersion: number;
}): AuthUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
    role: isUserRole(user.role) ? user.role : "EDITOR",
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    failedLoginAttempts: user.failedLoginAttempts,
    lockedUntil: user.lockedUntil,
    lastLoginAt: user.lastLoginAt,
    sessionVersion: user.sessionVersion,
  };
}

export async function findAuthUser(identifier: string): Promise<AuthUserRow | null> {
  const value = identifier.trim();
  if (!value) return null;
  const user = await withPrismaRetry(() =>
    prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: value, mode: "insensitive" } },
          { username: { equals: value, mode: "insensitive" } },
        ],
      },
    }),
  );
  return user ? mapUser(user) : null;
}

export async function findAuthUserById(id: string): Promise<AuthUserRow | null> {
  try {
    const user = await withPrismaRetry(() => prisma.user.findUnique({ where: { id } }));
    return user ? mapUser(user) : null;
  } catch {
    return null;
  }
}

export async function recordLoginFailure(id: string, attempts: number, lockedUntil: Date | null) {
  await withPrismaRetry(() =>
    prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: attempts, lockedUntil },
    }),
  );
}

export async function recordLoginSuccess(id: string) {
  await withPrismaRetry(() =>
    prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    }),
  );
}

export async function updateAuthPassword(id: string, passwordHash: string, options?: { forced?: boolean }) {
  await withPrismaRetry(() =>
    prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
        sessionVersion: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
  );
  void options;
}
