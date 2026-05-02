import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    // proof photos live in supabase storage; let next/image fetch + optimize
    // them. pathname narrows to the public storage prefix.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // control referrer data leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // prevent XSS in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // restrict permissions (camera needed for photo proof)
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), payment=()",
          },
          // strict transport security (HTTPS only)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // content security policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.ingest.us.sentry.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // suppress Sentry CLI noise in normal builds
  silent: !process.env.CI,
  org: "smoll-bets",
  project: "smoll-bets",
  // tunnel through next.js to bypass ad blockers that filter sentry.io
  tunnelRoute: "/monitoring",
  // strip the SDK's logger from prod bundles
  disableLogger: true,
  // don't try to upload source maps without an auth token (we skipped the wizard)
  sourcemaps: { disable: true },
});
