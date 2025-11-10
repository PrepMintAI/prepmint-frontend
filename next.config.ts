import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ✅ This skips ESLint checks during Vercel builds
  },
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin/blob/master/src/index.types.ts

    org: "prepmint",
    project: "frontend",

    // Only print logs for uploading source maps related errors
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    widenClientFileUpload: true,
  }
);
