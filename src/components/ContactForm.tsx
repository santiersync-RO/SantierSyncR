"use client";

import { useState, type FormEvent } from "react";
import styles from "./ContactForm.module.css";

type ContactValues = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const emptyValues: ContactValues = { name: "", email: "", company: "", message: "" };

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>(emptyValues);

  const update = (field: keyof ContactValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = "Solicitare prin website — ȘantierSync";
    const body = [
      `Nume: ${values.name.trim()}`,
      `E-mail: ${values.email.trim()}`,
      `Firmă: ${values.company.trim() || "Nespecificată"}`,
      "",
      "Cu ce ne puteți ajuta?",
      values.message.trim(),
    ].join("\n");

    window.location.href = `mailto:santiersync@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.topRow}>
        <label className={styles.field} htmlFor="contact-name">
          <span className={styles.label}>Numele tău</span>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Cum să-ți spunem?"
            maxLength={120}
            value={values.name}
            onChange={(event) => update("name", event.currentTarget.value)}
            required
          />
        </label>

        <label className={styles.field} htmlFor="contact-email">
          <span className={styles.label}>E-mail</span>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nume@firma.ro"
            maxLength={254}
            value={values.email}
            onChange={(event) => update("email", event.currentTarget.value)}
            required
          />
        </label>
      </div>

      <label className={styles.field} htmlFor="contact-company">
        <span className={styles.label}>Firmă <span className={styles.optional}>(opțional)</span></span>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          placeholder="Numele firmei"
          maxLength={120}
          value={values.company}
          onChange={(event) => update("company", event.currentTarget.value)}
        />
      </label>

      <label className={styles.field} htmlFor="contact-message">
        <span className={styles.label}>Cu ce te putem ajuta?</span>
        <textarea
          id="contact-message"
          placeholder="De exemplu: cum preluați și urmăriți acum cererile de ofertă?"
          rows={4}
          maxLength={1500}
          value={values.message}
          onChange={(event) => update("message", event.currentTarget.value)}
          required
        />
      </label>

      <button className={styles.submit} type="submit">
        <span>Deschide e-mailul pregătit</span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </button>

      <p className={styles.note}>
        Butonul deschide aplicația ta de e-mail cu un mesaj pregătit către santiersync@gmail.com. Datele nu sunt trimise sau stocate de acest site.
      </p>
    </form>
  );
}
