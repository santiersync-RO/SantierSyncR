"use client";

import { useState, type FormEvent } from "react";
import type { SiteContent } from "@/content/site-content";
import styles from "./ContactForm.module.css";

type ContactValues = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const emptyValues: ContactValues = { name: "", email: "", company: "", message: "" };

type ContactFormProps = {
  copy: SiteContent["contactForm"];
  recipientEmail: string;
};

export default function ContactForm({ copy, recipientEmail }: ContactFormProps) {
  const [values, setValues] = useState<ContactValues>(emptyValues);

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = copy.emailSubject;
    const body = [
      `Nume: ${values.name.trim()}`,
      `E-mail: ${values.email.trim()}`,
      `Firmă: ${values.company.trim() || copy.unspecifiedCompany}`,
      "",
      copy.messageHeading,
      values.message.trim(),
    ].join("\n");

    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.topRow}>
        <label className={styles.field} htmlFor="contact-name">
          <span className={styles.label}>{copy.nameLabel}</span>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder={copy.namePlaceholder}
            maxLength={120}
            value={values.name}
            onChange={(event) => update("name", event.currentTarget.value)}
            required
          />
        </label>

        <label className={styles.field} htmlFor="contact-email">
          <span className={styles.label}>{copy.emailLabel}</span>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={copy.emailPlaceholder}
            maxLength={254}
            value={values.email}
            onChange={(event) => update("email", event.currentTarget.value)}
            required
          />
        </label>
      </div>

      <label className={styles.field} htmlFor="contact-company">
        <span className={styles.label}>{copy.companyLabel} <span className={styles.optional}>{copy.optionalLabel}</span></span>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          placeholder={copy.companyPlaceholder}
          maxLength={120}
          value={values.company}
          onChange={(event) => update("company", event.currentTarget.value)}
        />
      </label>

      <label className={styles.field} htmlFor="contact-message">
        <span className={styles.label}>{copy.messageLabel}</span>
        <textarea
          id="contact-message"
          placeholder={copy.messagePlaceholder}
          rows={4}
          maxLength={1500}
          value={values.message}
          onChange={(event) => update("message", event.currentTarget.value)}
          required
        />
      </label>

      <button className={styles.submit} type="submit">
        <span>{copy.submitLabel}</span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </button>

      <p className={styles.note}>
        {copy.noteTemplate.replace("{email}", recipientEmail)}
      </p>
    </form>
  );
}
