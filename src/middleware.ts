// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // SECURITY FIX: Protect all role-specific dashboard routes
  const isProtectedRoute = url.pathname.startsWith("/admin") ||
                          url.pathname.startsWith("/dashboard/admin") ||
                          url.pathname.startsWith("/dashboard/teacher") ||
                          url.pathname.startsWith("/dashboard/institution") ||
                          url.pathname.startsWith("/dashboard/student") ||
                          url.pathname.startsWith("/dashboard/analytics");

  // Create response (with security headers for all routes)
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // If it's not a protected route, just add security headers and return
  if (!isProtectedRoute) {
    addSecurityHeaders(response);
    return response;
  }

  // For protected routes, verify Supabase session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie in both request and response
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from both request and response
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Verify the session with Supabase
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    // No valid session, redirect to login
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Valid session exists, let through
  // Role will be validated on the server-side in each page component
  // This prevents unauthorized users from even reaching the page
  addSecurityHeaders(response);
  return response;
}

// Helper function to add security headers
function addSecurityHeaders(response: NextResponse) {
  // Content-Security-Policy: Prevent XSS attacks
  // Updated for Supabase domains
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://www.youtube.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-src 'self' https://www.youtube.com; object-src 'none';"
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
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/teacher/:path*",
    "/dashboard/institution/:path*",
    "/dashboard/student/:path*",
    "/dashboard/analytics/:path*"
  ],
};
