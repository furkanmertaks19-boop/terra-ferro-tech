import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const user = req.auth?.user;
  const loggedIn = Boolean(user?.id);
  const path = req.nextUrl.pathname;
  const isLoginPage = path === "/admin/login";
  const isChangePassword = path === "/admin/change-password";

  if (path.startsWith("/admin") && !isLoginPage && !loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }

  if (loggedIn && user?.mustChangePassword && !isChangePassword && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/change-password", req.nextUrl.origin));
  }

  if (isLoginPage && loggedIn) {
    const dest = user?.mustChangePassword ? "/admin/change-password" : "/admin";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  if (isChangePassword && loggedIn && !user?.mustChangePassword) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
