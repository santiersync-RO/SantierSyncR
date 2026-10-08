import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteConfig.releaseReady) return [];

  const lastModified = new Date();

  return [
    { url: siteConfig.canonicalOrigin, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.canonicalOrigin}/confidentialitate`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.canonicalOrigin}/informatii-legale`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
