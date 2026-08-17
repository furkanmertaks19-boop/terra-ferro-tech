import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@/lib/roles";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  sessionVersion: number;
  mustChangePassword: boolean;
  username?: string | null;
};

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    },
  },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "E-posta veya kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser;
        token.id = authUser.id;
        token.role = authUser.role;
        token.sessionVersion = authUser.sessionVersion;
        token.mustChangePassword = authUser.mustChangePassword;
        token.username = authUser.username;
        token.name = authUser.name;
        token.email = authUser.email;
      }
      return token;
    },
    async session({ session, token }) {
      const id = typeof token.id === "string" ? token.id : "";
      const role = token.role as UserRole | undefined;
      const sessionVersion = typeof token.sessionVersion === "number" ? token.sessionVersion : Number(token.sessionVersion);
      if (!id || !role || !Number.isFinite(sessionVersion)) {
        return session;
      }
      session.user = {
        id,
        name: typeof token.name === "string" ? token.name : null,
        email: typeof token.email === "string" ? token.email : "",
        emailVerified: null,
        role,
        sessionVersion,
        mustChangePassword: Boolean(token.mustChangePassword),
        username: typeof token.username === "string" ? token.username : null,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
