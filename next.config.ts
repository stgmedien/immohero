import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      {
        // Pilot-Widget darf auf den eigenen Plattformen eingebettet werden
        source: "/widget/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://immohero.org https://*.immohero.org https://aeroone.eu https://*.aeroone.eu http://localhost:*",
          },
        ],
      },
    ];
  },
};

// withSentryConfig lädt das SDK; Source-Map-Upload passiert nur, wenn
// SENTRY_AUTH_TOKEN/org/project gesetzt sind — sonst still übersprungen.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableLogger: true,
  telemetry: false,
});
