import type { NextConfig } from "next";
import { isPublicIndexingEnabled } from "./src/config/indexing-policy.ts";

const allowPublicIndexing = isPublicIndexingEnabled(process.env);

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
    const scriptSources = ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "https://www.googletagmanager.com", "https://*.consentmanager.net"];
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
              `style-src 'self' 'unsafe-inline' https://*.consentmanager.net`,
              `img-src 'self' data: blob: https://cdn.sanity.io https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://*.consentmanager.net`,
              `font-src 'self' data: https://*.consentmanager.net`,
              `connect-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://www.google.com https://*.consentmanager.net`,
              `frame-src https://challenges.cloudflare.com https://*.consentmanager.net https://cal.com https://app.cal.com`,
              `base-uri 'self'`,
              `form-action 'self'`,
              `object-src 'none'`,
              studioAncestors
                ? `frame-ancestors 'self' ${studioAncestors.join(" ")}`
                : `frame-ancestors 'none'`,
            ].join("; "),
          },
          ...(!allowPublicIndexing
            ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
            : []),
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
