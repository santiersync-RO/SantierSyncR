import type { NextConfig } from "next";

const deploymentStage = process.env.DEPLOYMENT_STAGE?.trim().toLowerCase() || "live";
const isApprovedProduction =
  deploymentStage === "live" &&
  process.env.VERCEL_ENV === "production" &&
  process.env.RELEASE_APPROVED === "true" &&
  process.env.LEGAL_REVIEWED === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const scriptSources = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"];
    if (process.env.NODE_ENV === "development") scriptSources.push("'unsafe-eval'");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              `default-src 'self'`,
              `script-src ${scriptSources.join(" ")}`,
              `style-src 'self' 'unsafe-inline'`,
              `img-src 'self' data: blob:`,
              `font-src 'self' data:`,
              `connect-src 'self' https://challenges.cloudflare.com`,
              `frame-src https://challenges.cloudflare.com`,
              `base-uri 'self'`,
              `form-action 'self'`,
              `object-src 'none'`,
              `frame-ancestors 'none'`,
            ].join("; "),
          },
          ...(!isApprovedProduction
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
