"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/content/site-content";
import styles from "./Header.module.css";

type HeaderProps = {
  navigation: SiteContent["home"]["navigation"];
  logo: SiteContent["branding"]["logo"];
};

export default function Header({ navigation, logo }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#continut">
        Sari la conținut
      </a>
      <div className={`container ${styles.row}`}>
        <Link
          className={styles.logo}
          href="/"
          aria-label="ȘantierSync — pagina principală"
          onClick={closeMenu}
        >
          <span className={logo.originalCrop ? styles.logoCrop : styles.logoContain} aria-hidden="true">
            <Image
              src={logo.url}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              sizes="220px"
              loading="eager"
              unoptimized
            />
          </span>
        </Link>

        <button
          ref={menuToggleRef}
          className={styles.menuToggle}
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? navigation.menuClose : navigation.menuOpen}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </span>
          <span>{open ? navigation.close : navigation.menu}</span>
        </button>

        <nav
          id="main-navigation"
          className={`${styles.navigation} ${open ? styles.navigationOpen : ""}`}
          aria-label={navigation.label}
        >
          {navigation.links.map(({ label, href }) => (
            <Link key={href} href={href} onClick={closeMenu}>
              {label}
            </Link>
          ))}
          <Link
            className={styles.navCta}
            href="/#contact"
            onClick={closeMenu}
          >
            <span>{navigation.cta}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
