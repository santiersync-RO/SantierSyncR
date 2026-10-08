import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return siteConfig.releaseReady
    ? {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${siteConfig.canonicalOrigin}/sitemap.xml`,
      }
    : {
        rules: { userAgent: "*", disallow: "/" },
      };
}
