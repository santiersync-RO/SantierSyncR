import type { NextConfig } from "next";

const deploymentStage = process.env.DEPLOYMENT_STAGE?.trim().toLowerCase() || "live";
const isApprovedProduction =
  deploymentStage === "live" &&
  process.env.VERCEL_ENV === "production" &&
  process.env.RELEASE_APPROVED === "true" &&
  process.env.LEGAL_REVIEWED === "true";

function trustedStudioAncestors(): string[] | null {
  try {
    const url = new URL(process.env.SANITY_STUDIO_URL || "");
    const isHostedStudio = /^[a-z0-9-]+\.sanity\.studio$/.test(url.hostname);
    const isSanityDashboardStudio = (url.hostname === "sanity.io" || url.hostname === "www.sanity.io")
      && /^\/@[a-zA-Z0-9-]+\/studio\/[a-zA-Z0-9-]+(?:\/.*)?$/.test(url.pathname);
    if (url.protocol !== "https:" || (!isHostedStudio && !isSanityDashboardStudio)
      || url.username !== "" || url.password !== "" || url.port !== "" || url.search || url.hash) {
      return null;
    }

    return isSanityDashboardStudio
      ? ["https://sanity.io", "https://www.sanity.io"]
      : [url.origin];
  } catch { return null; }
}
const studioAncestors = trustedStudioAncestors();

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
          ...(!studioAncestors ? [{ key: "X-Frame-Options", value: "DENY" }] : []),
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
              `img-src 'self' data: blob: https://cdn.sanity.io`,
              `font-src 'self' data:`,
              `connect-src 'self' https://challenges.cloudflare.com`,
              `frame-src https://challenges.cloudflare.com`,
              `base-uri 'self'`,
              `form-action 'self'`,
              `object-src 'none'`,
              studioAncestors
                ? `frame-ancestors 'self' ${studioAncestors.join(" ")}`
                : `frame-ancestors 'none'`,
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
