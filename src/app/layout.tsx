import type { Metadata, Viewport } from "next";
import "@fontsource-variable/source-sans-3";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig, siteMetadata } from "@/config/site";
import { legalConfig } from "@/content/legal.ro";

export const metadata: Metadata = {
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
  robots: siteConfig.releaseReady
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#152D4B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
        <Header />
        {children}
        {siteConfig.releaseReady && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([organization, website]).replace(/</g, "\\u003c"),
            }}
          />
        )}
        <Footer />
      </body>
    </html>
  );
}
