import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.publicIndexingEnabled) return [];

  const lastModified = new Date();

  return [
    { url: siteConfig.canonicalOrigin, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.canonicalOrigin}/programare`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    ...(siteConfig.legalReady
      ? [
          { url: `${siteConfig.canonicalOrigin}/confidentialitate`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
          { url: `${siteConfig.canonicalOrigin}/informatii-legale`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
        ]
      : []),
  ];
}
