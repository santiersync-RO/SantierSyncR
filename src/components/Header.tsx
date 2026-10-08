"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { homeCopy } from "@/content/home.ro";
import styles from "./Header.module.css";

export default function Header() {
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
          <span className={styles.logoCrop} aria-hidden="true">
            <Image
              src="/brand/logo-original.png"
              alt=""
              width={1774}
              height={887}
              sizes="220px"
              loading="eager"
            />
          </span>
        </Link>

        <button
          ref={menuToggleRef}
          className={styles.menuToggle}
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? homeCopy.navigation.menuClose : homeCopy.navigation.menuOpen}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </span>
          <span>{open ? homeCopy.navigation.close : homeCopy.navigation.menu}</span>
        </button>

        <nav
          id="main-navigation"
          className={`${styles.navigation} ${open ? styles.navigationOpen : ""}`}
          aria-label={homeCopy.navigation.label}
        >
          {homeCopy.navigation.links.map(([label, href]) => (
            <Link key={href} href={href} onClick={closeMenu}>
              {label}
            </Link>
          ))}
          <Link
            className={styles.navCta}
            href="/#contact"
            onClick={closeMenu}
          >
            <span>{homeCopy.navigation.cta}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
