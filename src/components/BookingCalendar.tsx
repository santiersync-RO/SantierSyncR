"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { calendarLinks } from "@/lib/booking-links";
import { trackSiteEvent } from "@/lib/analytics-events";
import styles from "./BookingCalendar.module.css";

type BookingCalendarProps = {
  eventUrl: string;
  calLink: string;
};

export default function BookingCalendar({ eventUrl, calLink }: BookingCalendarProps) {
  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showDelayNotice, setShowDelayNotice] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const embedUrl = calendarLinks(eventUrl)?.embed;
  const publicCalUrl = calendarLinks(calLink)?.direct;

  useEffect(() => {
    if (!opened || loaded || frameError) return;
    const timer = window.setTimeout(() => setShowDelayNotice(true), 15000);
    return () => window.clearTimeout(timer);
  }, [opened, loaded, frameError]);

  if (!embedUrl) {
    return <p className={styles.error}>Programarea online este momentan indisponibilă. Scrie-ne și stabilim împreună un moment potrivit.</p>;
  }

  return (
    <div className={styles.calendar}>
      <p className={styles.privacy}>La deschidere se încarcă serviciul Cal.com. Datele rezervării sunt folosite pentru discuție și revenire. <Link href="/confidentialitate">Despre datele tale</Link>.</p>
      {!opened ? (
        <button className={styles.openButton} type="button" onClick={() => { setOpened(true); trackSiteEvent("calendar_open"); }}>
          Alege ziua și ora <span aria-hidden="true">→</span>
        </button>
      ) : (
        <>
          <iframe
            className={styles.frame}
            src={embedUrl}
            title="Alege un interval pentru discuția inițială ȘantierSync"
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFrameError(true)}
          />
          {(frameError || (showDelayNotice && !loaded)) && (
            <p className={styles.fallback} role="status">
              Dacă calendarul nu apare, {publicCalUrl ? <><a href={publicCalUrl} target="_blank" rel="noreferrer">deschide-l direct pe Cal.com</a> sau scrie-ne pentru a stabili un moment.</> : "scrie-ne pentru a stabili un moment."}
            </p>
          )}
        </>
      )}
      {publicCalUrl && <p className={styles.externalLink}>Preferi calendarul direct? <a href={publicCalUrl} target="_blank" rel="noreferrer">Deschide Cal.com</a></p>}
      <p className={styles.privacy}>Orele sunt afișate în fusul ales în calendar. Poți modifica fusul și formatul 12h/24h înainte să alegi ora.</p>
    </div>
  );
}
