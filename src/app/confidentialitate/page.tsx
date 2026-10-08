import type { Metadata } from "next";
import { legalConfig, legalDraftNotice } from "@/content/legal.ro";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Informare despre solicitările de contact și datele tehnice ale website-ului ȘantierSync.",
  alternates: siteConfig.releaseReady
    ? { canonical: `${siteConfig.canonicalOrigin}/confidentialitate` }
    : undefined,
  robots: { index: siteConfig.releaseReady, follow: siteConfig.releaseReady, ...(!siteConfig.releaseReady ? { noarchive: true } : {}) },
};

export default function ConfidentialitatePage() {
  return (
    <main id="continut" tabIndex={-1}>
      <article className="container legal-page">
        <h1>Politica de confidențialitate</h1>
        {!legalConfig.reviewed && (
          <aside className="draft-notice" role="note">
            <strong>Proiect de lucru</strong>
            <p>{legalDraftNotice}</p>
          </aside>
        )}

        <h2>Cine gestionează datele</h2>
        <p>
          Website-ul ȘantierSync este operat de {legalConfig.operatorName}. Adresa aplicabilă: {legalConfig.operatorAddress}.
          {legalConfig.registrationNumber ? ` Număr de înregistrare: ${legalConfig.registrationNumber}.` : ""}
          {legalConfig.taxId ? ` Date fiscale: ${legalConfig.taxId}.` : ""} Pentru întrebări despre date, scrie la{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>

        <h2>Date și scopuri</h2>
        <p>
          Formularul pregătește local un mesaj cu numele, adresa de e-mail și descrierea solicitării; denumirea firmei este opțională.
          Butonul deschide aplicația de e-mail a vizitatorului. Website-ul nu trimite și nu stochează valorile completate.
          Primim informațiile numai dacă vizitatorul trimite mesajul din aplicația sa de e-mail și le folosim pentru a răspunde
          solicitării și a discuta o posibilă colaborare. Hostingul poate prelucra date tehnice necesare funcționării și securității.
        </p>

        <h2>Temeiuri</h2>
        <p>Răspuns la solicitare: {legalConfig.requestBasis}. Securitate și prevenirea abuzului: {legalConfig.securityBasis}.</p>

        <h2>Furnizori și acces</h2>
        <p>{legalConfig.processorsPolicy}</p>

        <h2>Păstrarea datelor</h2>
        <p>{legalConfig.retentionPolicy}</p>

        <h2>Drepturile tale</h2>
        <p>
          Poți solicita accesul la date, rectificarea sau ștergerea lor, restricționarea prelucrării, te poți opune
          prelucrării și poți solicita portabilitatea acolo unde se aplică. Pentru a exercita aceste drepturi, scrie la{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>. Poți depune o plângere la{" "}
          <a href="https://www.dataprotection.ro/" rel="noreferrer">ANSPDCP</a>. Website-ul nu ia decizii automate cu
          efect juridic asupra persoanelor.
        </p>

        <h2>Tehnologii și stocare</h2>
        <p>{legalConfig.storagePolicy}</p>
        {!legalConfig.reviewed && (
          <p>Lista trebuie să corespundă tehnologiilor constatate efectiv în browser și la furnizori; nu presupune că nu există cookies sau alte forme de stocare.</p>
        )}

        <p><strong>Ultima actualizare:</strong> {legalConfig.lastUpdated}</p>
      </article>
    </main>
  );
}
