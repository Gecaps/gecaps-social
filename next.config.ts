import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/render": ["./templates/**/*"],
  },
  serverExternalPackages: ["@sparticuz/chromium", "@sparticuz/chromium-min", "puppeteer-core"],
};

export default nextConfig;
