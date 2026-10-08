import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import "@fontsource-variable/source-sans-3";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SanityPreview from "@/components/SanityPreview";
import { siteConfig } from "@/config/site";
import { legalConfig } from "@/content/legal.ro";
import { getDraftSiteContent, getSiteContent } from "@/lib/sanity.server";

export async function generateMetadata(): Promise<Metadata> {
  const draft = await draftMode();
  const content = await (draft.isEnabled ? getDraftSiteContent() : getSiteContent());
  const siteMetadata = content.seo;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: siteMetadata.title,
      template: "%s | ȘantierSync",
    },
    description: siteMetadata.description,
    applicationName: "ȘantierSync",
    alternates: siteConfig.releaseReady
      ? { canonical: siteConfig.canonicalOrigin }
      : undefined,
    openGraph: {
      type: "website",
      locale: "ro_RO",
      siteName: "ȘantierSync",
      title: siteMetadata.openGraphTitle,
      description: siteMetadata.openGraphDescription,
      ...(siteConfig.releaseReady
        ? { url: siteConfig.canonicalOrigin, images: ["/opengraph-image"] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: siteMetadata.openGraphTitle,
      description: siteMetadata.openGraphDescription,
      ...(siteConfig.releaseReady ? { images: ["/opengraph-image"] } : {}),
    },
    robots: siteConfig.releaseReady && !draft.isEnabled
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#152D4B",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const draft = await draftMode();
  const content = await (draft.isEnabled ? getDraftSiteContent() : getSiteContent());
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brand,
    url: siteConfig.canonicalOrigin,
    ...(siteConfig.legalReady && legalConfig.operatorType === "legal"
      ? { legalName: legalConfig.operatorName }
      : {}),
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brand,
    url: siteConfig.canonicalOrigin,
  };

  return (
    <html lang="ro">
      <body>
        <Header navigation={content.home.navigation} logo={content.branding.logo} />
        {children}
        {draft.isEnabled && <SanityPreview />}
        {draft.isEnabled && (
          <aside style={{ position: "fixed", right: 16, bottom: 16, zIndex: 30, display: "flex", alignItems: "center", gap: 12, padding: "9px 13px", border: "1px solid #c2410c", background: "#fff7ed", color: "#7c2d12", fontSize: 13, lineHeight: 1.3, boxShadow: "0 3px 14px rgb(21 45 75 / 14%)" }}>
            <span>Previzualizare — modificări nepublicate</span>
            <a href="/api/draft-mode/disable" style={{ color: "inherit", fontWeight: 700, textUnderlineOffset: 2 }}>Ieși</a>
          </aside>
        )}
        {siteConfig.releaseReady && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([organization, website]).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <Footer footer={content.footer} publicEmail={content.home.contactIntro.email} logo={content.branding.logo} />
      </body>
    </html>
  );
}
