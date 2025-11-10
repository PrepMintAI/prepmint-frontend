import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === "production",

  // Disable telemetry to suppress warnings
  telemetry: false,

  // Set sample rates for performance monitoring
  tracesSampleRate: 1.0,

  // Environment tracking
  environment: process.env.NODE_ENV,

  // Release tracking for better error grouping
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
});
