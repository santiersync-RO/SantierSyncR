import type { Metadata } from "next";
import Link from "next/link";
import BookingCalendar from "@/components/BookingCalendar";
import { bookingConfig } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { draftMode } from "next/headers";
import { getDraftSiteContent, getSiteContent } from "@/lib/sanity.server";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const draft = await draftMode();
  const indexable = siteConfig.indexingReady && !draft.isEnabled;
  return {
    title: "Programează o discuție de 30 min",
    description: "Identificăm problema prioritară din firma ta de construcții sau instalații și stabilim un prim pas concret. Cluj și împrejurimi.",
    alternates: { canonical: `${siteConfig.canonicalOrigin}/programare` },
    openGraph: {
      type: "website", locale: "ro_RO", siteName: "ȘantierSync",
      title: "O discuție de 30 de minute cu ȘantierSync",
      description: "Cererile, ofertele și următorul pas pentru echipa ta.",
      url: `${siteConfig.canonicalOrigin}/programare`, images: ["/opengraph-image"],
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false, noarchive: true },
  };
}

export default async function BookingPage() {
  const draft = await draftMode();
  const content = await (draft.isEnabled ? getDraftSiteContent() : getSiteContent());
  const contactEmail = content.home.contactIntro.email;

  return (
    <main id="continut" className={`container ${styles.page}`} tabIndex={-1}>
      <Link href="/" className={styles.backLink}>← Înapoi la pagina principală</Link>
      <p className="eyebrow">Discuție inițială</p>
      <h1>Un prim pas clar.<br />În 30 de minute.</h1>
      <p className={styles.intro}>Povestește-ne cum ajung cererile la firma ta și unde se blochează lucrurile. Discuția ne ajută să vedem dacă și cum putem lucra împreună.</p>
      <div className={styles.preparation}>
        <h2>Cu ce rămâi după discuție</h2>
        <ol>
          <li>Identificăm problema pe care merită să o rezolvăm prima.</li>
          <li>Vedem dacă este suficient un registru simplu în instrumentele existente.</li>
          <li>Stabilim ce ar presupune următorul pas: conținut, acces și un proiect pilot delimitat.</li>
        </ol>
        <p>Ca să ne pregătim, te întrebăm:</p>
        <ul>
          {bookingConfig.questions.map((question) => <li key={question.id}>{question.label}</li>)}
        </ul>
      </div>

      {bookingConfig.enabled ? (
        <BookingCalendar eventUrl={bookingConfig.eventUrl} calLink={bookingConfig.calLink} />
      ) : (
        <section className={styles.disabled} aria-labelledby="booking-disabled-title">
          <h2 id="booking-disabled-title">Programarea online nu este disponibilă momentan</h2>
          <p>Pentru o discuție inițială, scrie-ne și stabilim împreună un moment potrivit.</p>
          <a className="button" href={`mailto:${contactEmail}`}>Scrie-ne la {contactEmail}</a>
        </section>
      )}
      <p className={styles.contactAlternative}>Preferi să lași un mesaj? <Link href="/#contact">Mergi la formular</Link> sau scrie-ne la <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
    </main>
  );
}
