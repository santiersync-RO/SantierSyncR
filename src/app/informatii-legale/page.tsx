import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalConfig, legalDraftNotice } from "@/content/legal.ro";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Informații legale",
  description: "Identificarea operatorului și informații despre serviciile prezentate de ȘantierSync.",
  alternates: siteConfig.releaseReady
    ? { canonical: `${siteConfig.canonicalOrigin}/informatii-legale` }
    : undefined,
  robots: { index: siteConfig.releaseReady, follow: siteConfig.releaseReady, ...(!siteConfig.releaseReady ? { noarchive: true } : {}) },
};

export default function InformatiiLegalePage() {
  if (siteConfig.deploymentStage === "demo") notFound();

  return (
    <main id="continut" tabIndex={-1}>
      <article className="container legal-page">
        <h1>Informații legale</h1>
        {!legalConfig.reviewed && (
          <aside className="draft-notice" role="note">
            <strong>Proiect de lucru</strong>
            <p>{legalDraftNotice}</p>
          </aside>
        )}
        <p>
          <strong>Operator / prestator:</strong> {legalConfig.operatorName} (
          {legalConfig.operatorType === "natural"
            ? "persoană fizică"
            : legalConfig.operatorType === "legal"
              ? "persoană juridică"
              : legalConfig.operatorType}).
        </p>
        <p><strong>Adresă aplicabilă:</strong> {legalConfig.operatorAddress}</p>
        {legalConfig.registrationNumber && <p><strong>Număr de înregistrare:</strong> {legalConfig.registrationNumber}</p>}
        {legalConfig.taxId && <p><strong>Date fiscale:</strong> {legalConfig.taxId}</p>}
        <p><strong>Contact:</strong> <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a></p>
        <p>ȘantierSync este numele comercial folosit de operatorul identificat mai sus.</p>
        <h2>Informații despre servicii</h2>
        <p>
          Informațiile de pe website prezintă serviciile ȘantierSync. Obiectul lucrării, costurile, calendarul și condițiile
          de suport sunt stabilite într-o propunere și în acordul dintre părți. Trimiterea unui formular nu reprezintă
          acceptarea unei oferte sau încheierea unui contract.
        </p>
        <p><strong>Ultima actualizare:</strong> {legalConfig.lastUpdated}</p>
      </article>
    </main>
  );
}
