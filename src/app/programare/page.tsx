import type { Metadata } from "next";
import Link from "next/link";
import BookingCalendar from "@/components/BookingCalendar";
import { bookingConfig } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { draftMode } from "next/headers";
import { getDraftSiteContent, getSiteContent } from "@/lib/sanity.server";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Programează o discuție inițială",
  description: "Alege un interval pentru o discuție inițială de 30 de minute cu ȘantierSync.",
  robots: siteConfig.releaseReady && bookingConfig.enabled
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default async function BookingPage() {
  const draft = await draftMode();
  const content = await (draft.isEnabled ? getDraftSiteContent() : getSiteContent());
  const contactEmail = content.home.contactIntro.email;

  return (
    <main id="continut" className={`container ${styles.page}`} tabIndex={-1}>
      <Link href="/" className={styles.backLink}>← Înapoi la pagina principală</Link>
      <p className="eyebrow">Discuție inițială</p>
      <h1>Hai să vedem unde se potrivește ȘantierSync.</h1>
      <p className={styles.intro}>Rezervă o discuție de 30 de minute. Vorbim despre cum gestionați cererile și despre activitățile administrative care vă consumă cel mai mult timp.</p>
      <div className={styles.preparation}>
        <p>Ca să ne pregătim pentru discuție, vom aborda două întrebări:</p>
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
    </main>
  );
}
