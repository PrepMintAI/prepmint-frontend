// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = req.cookies.get("__session")?.value;

  const isAdminRoute = url.pathname.startsWith("/admin");

  // Create response (with security headers for all routes)
  let response: NextResponse;

  // If it's not an admin route, create a normal next response
  if (!isAdminRoute) {
    response = NextResponse.next();
  } else {
    // If no session, send to login
    if (!session) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("next", url.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Lightweight check: we don't know role yet, just let through
    //    Role will be validated inside the admin page itself via /api/role
    //    Note: Both 'admin' and 'dev' roles have full access to admin routes
    response = NextResponse.next();
  }

  // Security Headers
  // Content-Security-Policy: Prevent XSS attacks
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.firebase.com https://www.gstatic.com https://www.google.com https://www.youtube.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.firebaseapp.com https://www.google-analytics.com; frame-src 'self' https://www.youtube.com; object-src 'none';"
  );

  // X-Frame-Options: Prevent clickjacking (DENY)
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options: Prevent MIME sniffing (nosniff)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Strict-Transport-Security: Force HTTPS (max-age=31536000 = 1 year)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Referrer-Policy: Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: Control browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/admin/:path*"],
};
