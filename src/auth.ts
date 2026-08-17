import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
import { authConfig } from "@/auth.config";
import {
  findAuthUser,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/auth-db";

const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeOQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqh";

function identifierOf(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "E-posta veya kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials, request) => {
        const identifier = identifierOf(credentials?.username);
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!identifier || !password) return null;

        const ip = request ? clientIp(request.headers) : "unknown";

        const user = await findAuthUser(identifier);
        let valid = false;
        try {
          valid = await verifyPassword(password, user?.passwordHash || DUMMY_HASH);
        } catch {
          valid = false;
        }

        if (!user || !valid || !user.isActive || (user.lockedUntil && user.lockedUntil > new Date())) {
          if (!rateLimit(`login-fail:${ip}`, 25).ok) return null;
          if (user?.id && user.isActive) {
            const attempts = user.failedLoginAttempts + 1;
            await recordLoginFailure(
              user.id,
              attempts,
              attempts >= LOCK_AFTER ? new Date(Date.now() + LOCK_MS) : user.lockedUntil
            );
          }
          await writeAudit({
            userId: user?.id,
            action: "LOGIN_FAILURE",
            metadata: { identifier: identifier.slice(0, 80) },
          });
          return null;
        }

        await recordLoginSuccess(user.id);
        await writeAudit({ userId: user.id, action: "LOGIN_SUCCESS" });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
          mustChangePassword: user.mustChangePassword,
          username: user.username,
        };
      },
    }),
  ],
});
