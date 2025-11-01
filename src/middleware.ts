// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = req.cookies.get("__session")?.value;

  const isAdminRoute = url.pathname.startsWith("/admin");

  // If it's not an admin route, just continue
  if (!isAdminRoute) return NextResponse.next();

  // If no session, send to login
  if (!session) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Lightweight check: we don't know role yet, just let through
  //    Role will be validated inside the admin page itself via /api/role
  //    Note: Both 'admin' and 'dev' roles have full access to admin routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
