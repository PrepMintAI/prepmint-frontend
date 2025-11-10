import * as Sentry from "@sentry/nextjs";

const SENTRY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === "production";

export async function register() {
  if (!SENTRY_ENABLED) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  // Client-side Sentry initialization (browser)
  if (typeof window !== "undefined") {
    await import("../instrumentation-client");
  }
}

export async function onRequestError(error: Error, request: Request) {
  if (SENTRY_ENABLED) {
    Sentry.captureException(error, {
      tags: {
        'request.method': request.method,
        'request.url': request.url,
      },
      level: 'error',
    });
  }
}
