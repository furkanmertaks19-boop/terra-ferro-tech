import type { UserRole } from "@/lib/roles";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    sessionVersion: number;
    mustChangePassword: boolean;
    username?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      sessionVersion: number;
      mustChangePassword: boolean;
      username?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    sessionVersion?: number;
    mustChangePassword?: boolean;
    username?: string | null;
  }
}
