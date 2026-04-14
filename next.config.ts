import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/render": ["./templates/**/*"],
  },
};

export default withSentryConfig(nextConfig, {
  // Disable source map upload for now
  sourcemaps: {
    disable: true,
  },
  // Suppress logs during build
  silent: true,
  // Org and project for Sentry
  org: "latam-bs",
  project: "javascript-nextjs",
});
