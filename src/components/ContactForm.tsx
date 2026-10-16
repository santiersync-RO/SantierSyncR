"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { SiteContent } from "@/content/site-content";
import styles from "./ContactForm.module.css";

type ContactValues = { name: string; email: string; company: string; message: string };
const emptyValues: ContactValues = { name: "", email: "", company: "", message: "" };
type TurnstileApi = { render: (target: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

type ContactFormProps = {
  copy: SiteContent["contactForm"];
  recipientEmail: string;
  enabled?: boolean;
  siteKey?: string;
  readiness?: boolean;
};

export default function ContactForm({ copy, recipientEmail, enabled = false, siteKey = "", readiness = false }: ContactFormProps) {
  const [values, setValues] = useState<ContactValues>(emptyValues);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ kind: "sending" | "error" | "success"; text: string } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const previousPayload = useRef("");
  const requestId = useRef("");
  const inFlight = useRef(false);
  const available = enabled && readiness && Boolean(siteKey);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !widgetRef.current || widgetId.current || !siteKey) return;
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      action: "contact",
      size: window.matchMedia("(max-width: 360px)").matches ? "compact" : "flexible",
      callback: (value: string) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => { setToken(""); setStatus({ kind: "error", text: `Nu am putut verifica protecția anti-spam. Scrie-ne la ${recipientEmail}.` }); },
    });
  }, [recipientEmail, siteKey]);

  useEffect(() => () => {
    if (widgetId.current) {
      window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    }
  }, []);

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (status && status.kind !== "sending") setStatus(null);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!available || inFlight.current) return;
    if (!token) { setStatus({ kind: "error", text: "Bifează verificarea anti-spam înainte de trimitere." }); return; }
    inFlight.current = true;
    setBusy(true);
    setStatus({ kind: "sending", text: "Se trimite mesajul…" });
    const payload = JSON.stringify(values);
    const honeypot = new FormData(event.currentTarget).get("website");
    if (previousPayload.current !== payload || !requestId.current) {
      previousPayload.current = payload;
      requestId.current = crypto.randomUUID();
    }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, requestId: requestId.current, website: typeof honeypot === "string" ? honeypot : "", turnstileToken: token }),
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; message?: string } | null;
      if (!response.ok || result?.ok !== true) throw new Error(result?.message || `Nu am putut trimite mesajul. Scrie-ne la ${recipientEmail}.`);
      setStatus({ kind: "success", text: "Am primit mesajul tău. Îți vom răspunde pe email." });
      try {
        const { trackSiteEvent } = await import("@/lib/analytics-events");
        trackSiteEvent("contact_submit_success");
      } catch { /* Analytics must not change the submission result. */ }
      setValues(emptyValues);
      previousPayload.current = "";
      requestId.current = "";
      formRef.current?.querySelector<HTMLElement>("[role=status]")?.focus();
    } catch (error) {
      setStatus({ kind: "error", text: error instanceof Error ? error.message : `Nu am putut trimite mesajul. Scrie-ne la ${recipientEmail}.` });
      formRef.current?.querySelector<HTMLElement>("[role=status]")?.focus();
    } finally {
      inFlight.current = false;
      setBusy(false);
      setToken("");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    }
  };

  return (
    <>
      {available && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderWidget} />}
      <form ref={formRef} className={styles.form} method="post" action="/api/contact" onSubmit={submit} aria-busy={busy}>
        <div className={styles.topRow}>
          <label className={styles.field} htmlFor="contact-name"><span className={styles.label}>{copy.nameLabel}</span><input id="contact-name" name="name" type="text" autoComplete="name" placeholder={copy.namePlaceholder} maxLength={120} value={values.name} onChange={(event) => update("name", event.currentTarget.value)} required /></label>
          <label className={styles.field} htmlFor="contact-email"><span className={styles.label}>{copy.emailLabel}</span><input id="contact-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={copy.emailPlaceholder} maxLength={254} value={values.email} onChange={(event) => update("email", event.currentTarget.value)} required /></label>
        </div>
        <label className={styles.field} htmlFor="contact-company"><span className={styles.label}>{copy.companyLabel} <span className={styles.optional}>{copy.optionalLabel}</span></span><input id="contact-company" name="company" type="text" autoComplete="organization" placeholder={copy.companyPlaceholder} maxLength={120} value={values.company} onChange={(event) => update("company", event.currentTarget.value)} /></label>
        <label className={styles.field} htmlFor="contact-message"><span className={styles.label}>{copy.messageLabel}</span><textarea id="contact-message" name="message" placeholder={copy.messagePlaceholder} rows={4} maxLength={1500} value={values.message} onChange={(event) => update("message", event.currentTarget.value)} required /></label>
        <div className={styles.honeypot} aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        {available && <div className={styles.turnstile} ref={widgetRef} aria-label="Verificare anti-spam" />}
        {!available && <p className={styles.error} role="status">Formularul nu este disponibil momentan. Ne poți scrie la <a href={`mailto:${recipientEmail}`}>{recipientEmail}</a>.</p>}
        {status && <p className={status.kind === "success" ? styles.success : status.kind === "sending" ? styles.sending : styles.error} role="status" aria-live="polite" tabIndex={-1}>{status.text}</p>}
        <button className={styles.submit} type="submit" disabled={!available || busy}>
          <span>{busy ? "Se trimite…" : "Trimite cererea"}</span><span className={styles.arrow} aria-hidden="true">→</span>
        </button>
        <p className={styles.note}>Datele sunt folosite doar pentru a răspunde solicitării tale. Vezi <a href="/confidentialitate">politica de confidențialitate</a>. Ne poți scrie și la <a href={`mailto:${recipientEmail}`}>{recipientEmail}</a>.</p>
        <noscript><p className={styles.note}>Pentru a ne trimite un mesaj fără JavaScript, scrie-ne la <a href={`mailto:${recipientEmail}`}>{recipientEmail}</a>.</p></noscript>
      </form>
    </>
  );
}
