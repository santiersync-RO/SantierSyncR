import ContactForm from "@/components/ContactForm";
import { homeCopy } from "@/content/home.ro";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./home.module.css";

type IconName = "request" | "flow" | "documents" | "extract" | "support" | "check";

function Icon({ name }: { name: IconName }) {
  const common = {
    "aria-hidden": true as const,
    focusable: false as const,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<IconName, ReactNode> = {
    request: <><path d="M6 3.75h8l4 4v12.5H6z" /><path d="M14 3.75v4h4M9 12h6M9 15.5h6" /></>,
    flow: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /><path d="M10 7h4a2 2 0 0 1 2 2v5" /></>,
    documents: <><path d="M5 6.5 12 3l7 3.5-7 3.5z" /><path d="m5 10.5 7 3.5 7-3.5M5 14.5l7 3.5 7-3.5" /></>,
    extract: <><path d="M5 4.5h10l4 4v11H5z" /><path d="M15 4.5v4h4M8 12h5M8 15.5h4" /><circle cx="17.5" cy="17.5" r="2.5" /><path d="m19.3 19.3 1.7 1.7" /></>,
    support: <><path d="M4 5h16v12H9l-5 3z" /><path d="M8 9h8M8 12.5h6" /></>,
    check: <><path d="m5 12.5 4.2 4.2L19 7" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function SectionMarker({ number, label }: { number: string; label: string }) {
  return (
    <p className={styles.sectionMarker}>
      <span>{number}</span>
      <i aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}

export default function HomePage() {
  return (
    <main id="continut" tabIndex={-1}>
      <section className={styles.hero} id="acasa" aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.monoEyebrow}><i aria-hidden="true" />{homeCopy.hero.eyebrow}</p>
            <h1 className={styles.heroTitle} id="hero-title">
              {homeCopy.hero.title.map((line, index) => (
                <span className={index === 1 || index === 2 ? styles.orange : undefined} key={line}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={styles.heroDescription}>{homeCopy.hero.description}</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryLink} href="/#contact">
                {homeCopy.hero.primaryCta}<span aria-hidden="true">→</span>
              </Link>
              <Link className={styles.textLink} href="/#cum-functioneaza">
                {homeCopy.hero.secondaryCta}<span aria-hidden="true">↓</span>
              </Link>
            </div>
            <p className={styles.heroSupport}><i aria-hidden="true" />{homeCopy.hero.support}</p>
          </div>

          <div className={styles.heroBoard} role="group" aria-label="Flux de lucru demonstrativ">
            <div className={styles.boardTopline}>
              <span>{homeCopy.hero.visualLabel}</span>
              <span>{homeCopy.hero.visualStatus}</span>
            </div>
            <ol className={styles.boardStages}>
              {homeCopy.hero.stages.map((stage, index) => (
                <li className={index === 2 ? styles.boardFinal : ""} key={stage.title}>
                  <div className={styles.boardIcon}>
                    <Icon name={index === 0 ? "request" : index === 1 ? "documents" : "check"} />
                  </div>
                  <div className={styles.boardText}>
                    <span className={styles.boardLabel}>{stage.label}</span>
                    <strong>{stage.title}</strong>
                    <span className={styles.boardDescription}>{stage.description}</span>
                  </div>
                  {"status" in stage ? <span className={styles.boardStatus}>{stage.status}</span> : <span className={styles.boardDot} aria-hidden="true" />}
                  {index < 2 && <span className={styles.boardArrow} aria-hidden="true">↓</span>}
                </li>
              ))}
            </ol>
            <div className={styles.boardFootline}>
              <span>{homeCopy.hero.visualFootnote}</span>
              <i aria-hidden="true" />
              <span>{homeCopy.hero.visualRange}</span>
            </div>
          </div>
        </div>
        <div className={`container ${styles.heroBottomline}`}>
          <span>{homeCopy.hero.bottomLeft}</span>
          <span>{homeCopy.hero.bottomRight}</span>
        </div>
      </section>

      <section className={styles.services} id="ce-facem" aria-labelledby="services-title">
        <div className={`container ${styles.servicesIntro}`}>
          <div>
            <SectionMarker number={homeCopy.servicesIntro.number} label={homeCopy.servicesIntro.eyebrow} />
            <h2 className={styles.sectionTitle} id="services-title">
              <span>{homeCopy.servicesIntro.title[0]}</span>
              <span>{homeCopy.servicesIntro.title[1]}<em>{homeCopy.servicesIntro.title[2]}</em></span>
            </h2>
          </div>
          <div className={styles.servicesIntroCopy}>
            {homeCopy.servicesIntro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <div className={`container ${styles.serviceRows}`}>
          {homeCopy.services.map((service, index) => (
            <article className={styles.serviceRow} key={service.title}>
              <span className={styles.rowNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.serviceIcon}><Icon name={["request", "flow", "documents", "extract", "support"][index] as IconName} /></span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className={styles.rowArrow} aria-hidden="true">↗</span>
            </article>
          ))}
          <p className={styles.servicesNote}><i aria-hidden="true" />{homeCopy.servicesIntro.note}</p>
        </div>
      </section>

      <section className={styles.process} id="cum-functioneaza" aria-labelledby="process-title">
        <div className={`container ${styles.processInner}`}>
          <div className={styles.processIntro}>
            <div>
              <SectionMarker number={homeCopy.processIntro.number} label={homeCopy.processIntro.eyebrow} />
              <h2 className={styles.darkSectionTitle} id="process-title">
                <span>{homeCopy.processIntro.title[0]}</span>
                <span className={styles.orange}>{homeCopy.processIntro.title[1]}</span>
              </h2>
            </div>
            <p>{homeCopy.processIntro.description}</p>
          </div>
          <ol className={styles.processSteps}>
            {homeCopy.demonstration.map((step, index) => (
              <li key={step.title}>
                <div className={styles.processStepTop}>
                  <span className={styles.processStepNumber}>0{index + 1}</span>
                  <span className={styles.processIcon}><Icon name={["request", "documents", "flow", "check"][index] as IconName} /></span>
                </div>
                <i className={styles.processDot} aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <aside className={styles.controlCallout}>
            <span className={styles.controlCheck}><Icon name="check" /></span>
            <div>
              <h3>{homeCopy.processIntro.caveatTitle}</h3>
              <p>{homeCopy.processIntro.caveat}</p>
            </div>
            <span className={styles.controlLabel}>{homeCopy.processIntro.caveatLabel}</span>
          </aside>
        </div>
      </section>

      <section className={styles.collaboration} id="cum-lucram" aria-labelledby="collaboration-title">
        <div className={`container ${styles.collaborationGrid}`}>
          <div className={styles.collaborationIntro}>
            <SectionMarker number={homeCopy.collaborationIntro.number} label={homeCopy.collaborationIntro.eyebrow} />
            <h2 className={styles.sectionTitle} id="collaboration-title">
              <span>{homeCopy.collaborationIntro.title[0]}</span>
              <span className={styles.orange}>{homeCopy.collaborationIntro.title[1]}</span>
            </h2>
            <p>{homeCopy.collaborationIntro.description}</p>
          </div>
          <ol className={styles.collaborationRows}>
            {homeCopy.collaboration.map((step, index) => (
              <li key={step.title}>
                <span className={styles.collaborationLetter}>{String.fromCharCode(65 + index)}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <span className={styles.collaborationArrow} aria-hidden="true">›</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.about} id="despre-noi" aria-labelledby="about-title">
        <div className={`container ${styles.aboutGrid}`}>
          <div className={styles.aboutMark} aria-hidden="true">
            <span>SS</span><i />
          </div>
          <div className={styles.aboutCopy}>
            <SectionMarker number={homeCopy.about.number} label={homeCopy.about.eyebrow} />
            <h2 className={styles.aboutTitle} id="about-title">
              <span>{homeCopy.about.title[0]}</span>
              <span>{homeCopy.about.title[1]}<em>{homeCopy.about.title[2]}</em></span>
            </h2>
            {homeCopy.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <Link className={styles.aboutLink} href="/#contact">
              {homeCopy.about.cta}<span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.aboutSideLabels} aria-hidden="true">
            {homeCopy.about.sideLabels.map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.contact} id="contact" aria-labelledby="contact-title">
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactIntro}>
            <SectionMarker number={homeCopy.contactIntro.number} label={homeCopy.contactIntro.eyebrow} />
            <h2 className={styles.sectionTitle} id="contact-title">
              <span>{homeCopy.contactIntro.title[0]}</span>
              <span className={styles.orange}>{homeCopy.contactIntro.title[1]}</span>
            </h2>
            <p>{homeCopy.contactIntro.description}</p>
            <a className={styles.emailLink} href={`mailto:${homeCopy.contactIntro.email}`}>
              {homeCopy.contactIntro.email}<span aria-hidden="true">↗</span>
            </a>
            <p className={styles.contactNote}><i aria-hidden="true" />{homeCopy.contactIntro.note}</p>
          </div>
          <div className={styles.formWrap}>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
