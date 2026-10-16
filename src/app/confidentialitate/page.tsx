import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { legalConfig, legalDraftNotice } from "@/content/legal.ro";
import { siteConfig } from "@/config/site";
import { bookingConfig } from "@/config/booking";

export async function generateMetadata(): Promise<Metadata> {
  const draft = await draftMode();
  const indexable = siteConfig.publicIndexingEnabled && siteConfig.legalReady && !draft.isEnabled;
  return {
    title: "Politica de confidențialitate",
    description: "Informare despre solicitările de contact și datele tehnice ale website-ului ȘantierSync.",
    alternates: siteConfig.publicIndexingEnabled && !draft.isEnabled
      ? { canonical: `${siteConfig.canonicalOrigin}/confidentialitate` }
      : undefined,
    robots: { index: indexable, follow: indexable, ...(!indexable ? { noarchive: true } : {}) },
  };
}

export default async function ConfidentialitatePage() {
  const draft = await draftMode();
  const trackingEnabled = siteConfig.deploymentStage === "live" &&
    process.env.VERCEL_ENV === "production" && !draft.isEnabled;

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
          {legalConfig.reviewed
            ? <>Website-ul ȘantierSync este operat de {legalConfig.operatorName}. Adresa aplicabilă: {legalConfig.operatorAddress}.
              {legalConfig.registrationNumber ? ` Număr de înregistrare: ${legalConfig.registrationNumber}.` : ""}
              {legalConfig.taxId ? ` Date fiscale: ${legalConfig.taxId}.` : ""}</>
            : <>ȘantierSync este serviciul prezentat pe acest website. Identitatea și datele de contact ale operatorului urmează să fie publicate după verificare.</>}{" "}Pentru întrebări despre date, scrie la{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>

        <h2>Date și scopuri</h2>
        <p>
          {siteConfig.contactEnabled
            ? <>Dacă formularul API este activ, el transmite numele, adresa de e-mail, mesajul și, dacă este completată, denumirea firmei către Resend pentru livrarea solicitării. Formularul folosește Cloudflare Turnstile pentru prevenirea abuzului. Dacă sunt activate separat integrarea și verificarea registrului, aceleași date sunt transmise și către un registru privat în Google Sheets.</>
            : <>Formularul API este dezactivat. Valorile completate pe pagină nu sunt trimise sau salvate de website; pentru contact, vizitatorul poate scrie la adresa de e-mail publicată.</>}{" "}Hostingul poate prelucra date tehnice necesare funcționării și securității.
        </p>

        <h2>Programări</h2>
        <p>{bookingConfig.enabled
          ? <>Pagina de programare încarcă un calendar Cal.com. Când soliciți un interval, Cal.com prelucrează datele introduse pentru gestionarea rezervării și o sincronizează cu Google Calendar. Evenimentele Cal.com confirmate sunt validate prin webhook semnat și înregistrate în registrul privat Google Sheets pentru programări. Deschiderea calendarului nu reprezintă o rezervare.</>
          : <>Programarea online este dezactivată în configurația curentă; website-ul nu încarcă calendarul Cal.com și nu transmite date de rezervare.</>}</p>

        <h2>Temeiuri</h2>
        <p>{legalConfig.reviewed
          ? <>Răspuns la solicitare: {legalConfig.requestBasis}. Securitate și prevenirea abuzului: {legalConfig.securityBasis}.</>
          : <>Temeiurile și condițiile aplicabile fiecărei prelucrări sunt în curs de verificare și nu sunt prezentate aici ca informare finală.</>}</p>

        <h2>Furnizori și acces</h2>
        <p>
          {legalConfig.reviewed ? legalConfig.processorsPolicy : "Furnizorii și rolurile lor sunt în curs de confirmare."}{" "}
          {trackingEnabled
            ? <>Consentmanager furnizează bannerul și centrul de preferințe și primește date tehnice necesare afișării și înregistrării opțiunilor. Google Analytics 4, furnizat de Google, se încarcă numai după alegerea salvată pentru statistici; poate primi informații despre paginile vizitate și navigare. Nu este configurat pentru publicitate. Informații despre prelucrarea Google sunt disponibile în <a href="https://policies.google.com/privacy" rel="noreferrer">Politica de confidențialitate Google</a>.</>
            : <>În această randare, Consentmanager și Google Analytics sunt dezactivate.</>}
        </p>

        <h2>Păstrarea datelor</h2>
        <p>{legalConfig.reviewed ? legalConfig.retentionPolicy : "Termenele de păstrare pentru fiecare categorie de date sunt în curs de stabilire și verificare."}</p>

        <h2>Drepturile tale</h2>
        <p>
          Poți solicita accesul la date, rectificarea sau ștergerea lor, restricționarea prelucrării, te poți opune
          prelucrării și poți solicita portabilitatea acolo unde se aplică. Pentru a exercita aceste drepturi, scrie la{" "}
          <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>. Poți depune o plângere la{" "}
          <a href="https://www.dataprotection.ro/" rel="noreferrer">ANSPDCP</a>. Website-ul nu ia decizii automate cu
          efect juridic asupra persoanelor.
        </p>

        <h2>Tehnologii și stocare</h2>
        <p>
          {legalConfig.reviewed ? legalConfig.storagePolicy : "Detaliile privind tehnologiile, stocarea și perioadele lor de păstrare sunt în curs de verificare."}{" "}
          {trackingEnabled
            ? <>Consentmanager gestionează starea alegerii; perioada ei depinde de configurația furnizorului. După acordul pentru statistici, Google Analytics poate folosi cookie-uri precum _ga și _ga_*; refuzul sau retragerea oprește măsurarea și șterge cookie-urile Google Analytics accesibile pe domeniul curent. Retragerea nu șterge datele deja primite de Google. Verifică „Preferințe cookies” pentru modificarea alegerii.</>
            : <>Aceste tehnologii nu sunt încărcate în această randare.</>}
        </p>
        <p>
          Datele formularului de contact nu sunt trimise ca evenimente de analiză de către site.
        </p>
        {!legalConfig.reviewed && (
          <p>Lista trebuie să corespundă tehnologiilor constatate efectiv în browser și la furnizori; nu presupune că nu există cookies sau alte forme de stocare.</p>
        )}

        {legalConfig.reviewed && <p><strong>Ultima actualizare:</strong> {legalConfig.lastUpdated}</p>}
      </article>
    </main>
  );
}
