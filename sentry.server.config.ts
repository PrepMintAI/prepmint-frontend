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

  // Filter out sensitive data before sending to Sentry
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers["Authorization"];
      delete event.request.headers["Cookie"];
    }

    // Filter out Firebase credentials from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter((crumb) => {
        if (
          crumb.message &&
          (crumb.message.includes("FIREBASE_ADMIN") ||
            crumb.message.includes("PRIVATE_KEY"))
        ) {
          return false;
        }
        return true;
      });
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Firebase Auth errors
    "Firebase Auth error",
    "auth/",
    // Network errors
    "NetworkError",
  ],
});
