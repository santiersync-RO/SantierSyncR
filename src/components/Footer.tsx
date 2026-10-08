"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import styles from "./Footer.module.css";

const legalRoutes = new Set(["/confidentialitate", "/informatii-legale"]);

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.topRow}>
          <Link className={styles.logo} href="/" aria-label="ȘantierSync — pagina principală">
            <span className={styles.logoCrop} aria-hidden="true">
              <Image
                src="/brand/logo-original.png"
                alt=""
                width={1774}
                height={887}
                sizes="155px"
              />
            </span>
          </Link>
          <p className={styles.slogan}>Organizare pentru munca din teren.</p>
          <a className={styles.emailLink} href={`mailto:${siteConfig.publicEmail}`}>
            {siteConfig.publicEmail}<span aria-hidden="true"> ↗</span>
          </a>
          <p className={styles.copyright}>© 2026 ȘantierSync</p>
        </div>

        {pathname && legalRoutes.has(pathname) && (
          <nav className={styles.legalLinks} aria-label="Linkuri legale">
            <Link href="/confidentialitate">Politica de confidențialitate</Link>
            <Link href="/informatii-legale">Informații legale</Link>
          </nav>
        )}

        <div className={styles.bottomRow}>
          <p className={styles.location}>CLUJ · ROMÂNIA</p>
          <Link className={styles.backToTop} href="/#acasa">
            ÎNAPOI SUS <span aria-hidden="true">↑</span>
          </Link>
          <p className={styles.motto}>OMUL RĂMÂNE LA VOLAN.</p>
        </div>
      </div>
    </footer>
  );
}
