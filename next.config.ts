import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.sandbox-v2.revolte.io"],
  async headers() {
    const scriptPolicy =
      process.env.NODE_ENV === "development"
        ? "'self' 'unsafe-inline' 'unsafe-eval'"
        : "'self' 'unsafe-inline'";
    const connectPolicy =
      process.env.NODE_ENV === "development"
        ? "'self' ws://localhost:4173 wss://*.sandbox-v2.revolte.io"
        : "'self'";
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src ${scriptPolicy}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      `connect-src ${connectPolicy}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://revolte.ai https://*.revolte.ai",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
