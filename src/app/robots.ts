import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return siteConfig.publicIndexingEnabled
    ? {
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: `${siteConfig.canonicalOrigin}/sitemap.xml`,
      }
    : {
        rules: { userAgent: "*", disallow: "/" },
      };
}
