import ContactForm from "@/components/ContactForm";
import { draftMode } from "next/headers";
import { getDraftSiteContent, getSiteContent } from "@/lib/sanity.server";
import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";
import { siteConfig } from "@/config/site";
import { verifiedTeamProfiles } from "@/content/home.ro";

export default async function HomePage() {
  const draft = await draftMode();
  const content = await (draft.isEnabled ? getDraftSiteContent() : getSiteContent());
  const email = content.home.contactIntro.email;
  const offers = content.home.offers;
  const requests = content.home.demoRequests;
  const faq = content.home.faq;

  return <main id="continut" className={styles.page} tabIndex={-1}>
    <section className={`container ${styles.hero}`} id="acasa">
      <p className={styles.eyebrow}>PARTENER OPERAȚIONAL · CLUJ ȘI ÎMPREJURIMI</p>
      <div className={styles.heroGrid}>
        <div>
          <h1>Mai puțin haos.<br /><span>Mai multă treabă dusă la capăt.</span></h1>
          <p className={styles.lead}>{content.home.hero.description}</p>
          <div className={styles.actions}><Link className={styles.button} href="/programare">{content.home.hero.primaryCta} <span aria-hidden="true">→</span></Link><a className={styles.secondary} href="#exemplu">{content.home.hero.secondaryCta} <span aria-hidden="true">↓</span></a></div>
          <p className={styles.toolNote}>Pornim de la instrumentele pe care le folosești deja; conectarea lor se confirmă după ce le evaluăm.</p>
        </div>
        <aside className={styles.heroCard} aria-label="Rezultatul unei cereri urmărite în registru">
          <p className={styles.cardLabel}>EXEMPLU DEMONSTRATIV · DATE FICTIVE</p><h2>Revizie centrală termică</h2>
          <dl><div><dt>Responsabil</dt><dd>Mara</dd></div><div><dt>Stadiu</dt><dd>De clarificat</dd></div><div><dt>Lipsește</dt><dd>Modelul centralei</dd></div><div><dt>Următorul pas</dt><dd>Solicită seria aparatului</dd></div></dl>
          <p className={styles.cardFoot}>Echipa știe cine continuă și ce informație așteaptă.</p>
        </aside>
      </div>
    </section>

    <section className={styles.offers} id="ce-facem" aria-labelledby="offers-title"><div className="container">
      <p className={styles.eyebrow}>CU CE PUTEM ÎNCEPE</p><h2 id="offers-title">Un pas concret pentru<br /><span>lucrul de zi cu zi.</span></h2>
      <div className={styles.offerGrid}>{offers.map((offer, i) => <article className={`${styles.offer} ${i === 0 ? styles.featured : ""}`} key={offer.title}>
        <span className={styles.offerNumber}>0{i + 1}{i === 0 ? " · PILOT" : ""}</span><h3>{offer.title}</h3><p className={styles.offerDesc}>{offer.description}</p><p className={styles.offerDetail}>{offer.detail}</p><p className={styles.price}>{offer.price}</p>
        {offer.scope && <p className={styles.scope}>{offer.scope}</p>}
        <Link className={styles.offerCta} href="/programare">Programează o discuție de 30 min <span aria-hidden="true">→</span></Link>
      </article>)}</div>
      <p className={styles.partnerNote}>Promovarea locală prin parteneri specializați poate fi analizată separat, după confirmarea disponibilității și a bugetului.</p>
    </div></section>

    <section className={styles.demo} id="exemplu" aria-labelledby="demo-title"><div className="container">
      <p className={styles.eyebrow}>EXEMPLU DE REGISTRU</p><h2 id="demo-title">O vedere comună.<br /><span>Un pas următor clar.</span></h2>
      <p className={styles.demoNotice}>Exemplu demonstrativ — date fictive</p>
      <div className={styles.tableWrap}><table className={styles.register}><thead><tr><th scope="col">Lucrare</th><th scope="col">Responsabil</th><th scope="col">Stadiu</th><th scope="col">Informații lipsă</th><th scope="col">Următoarea acțiune</th><th scope="col">Termen</th></tr></thead><tbody>{requests.map((r) => <tr key={r.work}><th scope="row">{r.work}</th><td>{r.owner}</td><td>{r.status}</td><td>{r.missing}</td><td>{r.next}</td><td>{r.due}</td></tr>)}</tbody></table></div>
      <div className={styles.requestGrid}>{requests.map((r) => <article className={styles.requestCard} key={`mobile-${r.work}`}><h3>{r.work}</h3><dl><div><dt>Responsabil</dt><dd>{r.owner}</dd></div><div><dt>Stadiu</dt><dd>{r.status}</dd></div><div><dt>Informații lipsă</dt><dd>{r.missing}</dd></div><div><dt>Următoarea acțiune</dt><dd>{r.next}</dd></div><div><dt>Termen</dt><dd>{r.due}</dd></div></dl></article>)}</div>
      <p className={styles.demoBenefit}>Dacă un coleg preia solicitarea, găsește contextul și poate continua fără să reia totul de la zero.</p>
    </div></section>

    <section className={styles.process} id="cum-lucram" aria-labelledby="process-title"><div className="container">
      <p className={styles.eyebrow}>CUM LUCRĂM</p><h2 id="process-title">Înțelegem, agreăm,<br /><span>testăm și predăm.</span></h2>
      <ol className={styles.processSteps}>{content.home.collaboration.map((step) => <li key={step.title}><h3>{step.title}</h3><p>{step.description}</p></li>)}</ol>
      <p className={styles.processNote}>Oferta și mesajele către client sunt verificate și aprobate de persoana responsabilă din firma ta.</p>
    </div></section>

    <section className={styles.about} id="despre-noi"><div className="container">
      <p className={styles.eyebrow}>DESPRE ȘANTIERSYNC</p><h2>Începem cu o problemă reală<br /><span>și o rezolvăm împreună.</span></h2>
      <p>Suntem la început de drum ca proiect și dezvoltăm aplicații web și instrumente practice care leagă informațiile și pașii de lucru ai echipelor. Lucrăm aproape de firmele din Cluj și împrejurimi, cu un proiect pilot bine delimitat și verificat împreună cu oamenii care îl vor folosi.</p>
      <p>Mai întâi înțelegem cum lucrați. Apoi agreăm ce intră în implementare, testăm cu echipa și predăm fluxul cu instrucțiuni clare. Deciziile și aprobarea răspunsurilor rămân la voi.</p>
      <Link className={styles.button} href="/programare">Programează o discuție de 30 min <span aria-hidden="true">→</span></Link>
      {verifiedTeamProfiles.filter((profile) => [profile.name, profile.role, profile.bio, profile.photo].every((value) => value.trim().length > 0)).length > 0 && <div className={styles.teamGrid} aria-label="Echipa ȘantierSync">{verifiedTeamProfiles.filter((profile) => [profile.name, profile.role, profile.bio, profile.photo].every((value) => value.trim().length > 0)).map((profile) => <article className={styles.teamCard} key={profile.name}><Image src={profile.photo} alt="" width={320} height={240} unoptimized /><h3>{profile.name}</h3><p className={styles.teamRole}>{profile.role}</p><p>{profile.bio}</p></article>)}</div>}
    </div></section>

    <section className={styles.faq}><div className="container"><p className={styles.eyebrow}>ÎNTREBĂRI PRACTICE</p><h2>Înainte să începem.</h2><div className={styles.faqGrid}>
      {faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
    </div></div></section>

    <section className={styles.contact} id="contact"><div className="container">
      <p className={styles.eyebrow}>HAI SĂ VORBIM</p><h2>Programează o discuție<br /><span>de 30 min.</span></h2>
      <p>Ne uităm împreună la felul în care ajung cererile la echipa ta și alegem un pas practic de început.</p>
      <div className={styles.actions}><Link className={styles.button} href="/programare">Programează o discuție de 30 min <span aria-hidden="true">→</span></Link><a className={styles.secondary} href={`mailto:${email}`}>Scrie-ne la {email}</a></div>
      <div className={styles.contactForm}><ContactForm copy={content.contactForm} recipientEmail={email} enabled={siteConfig.contactEnabled} readiness={siteConfig.contactEnabled} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""} /></div>
    </div></section>
  </main>;
}
