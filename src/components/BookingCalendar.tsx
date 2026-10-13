"use client";

import { useEffect, useState } from "react";
import styles from "./BookingCalendar.module.css";

type BookingCalendarProps = {
  eventUrl: string;
  calLink: string;
};

function getEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" || url.hostname !== "cal.com" || url.port ||
      url.username || url.password || url.search || url.hash ||
      !/^\/santiersyncro\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
    ) return null;
    url.searchParams.set("embed", "true");
    return url.toString();
  } catch {
    return null;
  }
}

function getPublicCalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "cal.com" && !url.port &&
      !url.username && !url.password && !url.search && !url.hash &&
      /^\/santiersyncro\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default function BookingCalendar({ eventUrl, calLink }: BookingCalendarProps) {
  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showDelayNotice, setShowDelayNotice] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const embedUrl = getEmbedUrl(eventUrl);
  const publicCalUrl = getPublicCalUrl(calLink);

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
      {!opened ? (
        <button className={styles.openButton} type="button" onClick={() => setOpened(true)}>
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
          {(showDelayNotice || frameError) && !loaded && (
            <p className={styles.fallback} role="status">
              Dacă calendarul nu apare, {publicCalUrl ? <><a href={publicCalUrl} target="_blank" rel="noreferrer">deschide-l direct pe Cal.com</a> sau scrie-ne pentru a stabili un moment.</> : "scrie-ne pentru a stabili un moment."}
            </p>
          )}
        </>
      )}
      {publicCalUrl && <p className={styles.externalLink}>Preferi calendarul direct? <a href={publicCalUrl} target="_blank" rel="noreferrer">Deschide Cal.com</a></p>}
      <p className={styles.privacy}>Cal.com gestionează rezervarea. Detaliile acesteia se sincronizează cu Google Calendar și sunt păstrate în registrul privat Google Sheets pentru revenirea după discuție.</p>
    </div>
  );
}
