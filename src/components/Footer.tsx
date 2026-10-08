"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteContent } from "@/content/site-content";
import styles from "./Footer.module.css";

const legalRoutes = new Set(["/confidentialitate", "/informatii-legale"]);

type FooterProps = {
  footer: SiteContent["footer"];
  publicEmail: string;
  logo: SiteContent["branding"]["logo"];
};

export default function Footer({ footer, publicEmail, logo }: FooterProps) {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.topRow}>
          <Link className={styles.logo} href="/" aria-label="ȘantierSync — pagina principală">
            <span className={logo.originalCrop ? styles.logoCrop : styles.logoContain} aria-hidden="true">
              <Image
                src={logo.url}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                sizes="155px"
                unoptimized
              />
            </span>
          </Link>
          <p className={styles.slogan}>{footer.slogan}</p>
          <a className={styles.emailLink} href={`mailto:${publicEmail}`}>
            {publicEmail}<span aria-hidden="true"> ↗</span>
          </a>
          <p className={styles.copyright}>{footer.copyright}</p>
        </div>

        {pathname && legalRoutes.has(pathname) && (
          <nav className={styles.legalLinks} aria-label="Linkuri legale">
            <Link href="/confidentialitate">Politica de confidențialitate</Link>
            <Link href="/informatii-legale">Informații legale</Link>
          </nav>
        )}

        <div className={styles.bottomRow}>
          <p className={styles.location}>{footer.location}</p>
          <Link className={styles.backToTop} href="/#acasa">
            {footer.backToTop} <span aria-hidden="true">↑</span>
          </Link>
          <p className={styles.motto}>{footer.motto}</p>
        </div>
      </div>
    </footer>
  );
}
