import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="continut" tabIndex={-1}>
      <section className="container section" aria-labelledby="not-found-title">
        <p className="eyebrow">ȘantierSync</p>
        <h1 id="not-found-title">Pagina nu a fost găsită.</h1>
        <p>Adresa accesată nu duce la o pagină disponibilă.</p>
        <Link className="button" href="/">
          Înapoi la pagina principală
        </Link>
      </section>
    </main>
  );
}
