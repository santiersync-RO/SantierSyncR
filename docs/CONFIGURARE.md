# Configurare

Acest ghid este pentru proprietarul proiectului. Nu trimite parole sau tokenuri în conversații, issue-uri sau cod. Adaugă secretele direct în Vercel Environment Variables și păstrează fișierele `.env.local` în afara Git.

## Domeniu și hosting

1. Domeniul canonic confirmat este `santiersync.ro` (ASCII, fără diacritice). Configurează `https://santiersync.ro` în Vercel și verifică DNS-ul și certificatul TLS. `santiersync.com` poate fi adăugat ulterior ca redirect după configurarea DNS.
2. Setează Node.js 24.x pentru Development, Preview și Production.
3. Păstrează preview-ul protejat prin controalele de acces ale proiectului. `noindex` și `robots.txt` reduc indexarea, dar nu protejează conținutul privat.
4. Înainte de folosirea comercială, confirmă planul Vercel potrivit, limitele și alertele de cost. Verifică prețurile actuale în [pagina Vercel](https://vercel.com/pricing); nu presupune că utilizarea suplimentară este inclusă.

## Variabile și valori

`.env.example` conține numele variabilelor și nu are secrete reale. Copiază-l în `.env.local` doar pentru dezvoltare. În Vercel setează separat valorile pentru fiecare mediu. Homepage-ul actual folosește un link `mailto:`; nu are formular și nu trimite email prin server. Variabilele `CONTACT_*`, Resend, Turnstile și WAF de mai jos sunt pentru endpointul API păstrat în repository pentru o integrare viitoare; acesta rămâne nelegat de homepage și dezactivat.

| Variabilă | Scop și condiție |
|---|---|
| `SITE_URL` | În producție, exact `https://santiersync.ro`; preview-ul local poate folosi URL-ul său local. |
| `DOMAIN_CONFIRMED` | `true` numai după ce proprietarul a verificat controlul domeniului, DNS-ul și HTTPS. |
| `LEGAL_OPERATOR_NAME`, `LEGAL_OPERATOR_TYPE` | Identitatea reală și `natural` sau `legal`; brandul nu ține loc de operator. |
| `LEGAL_OPERATOR_ADDRESS` | Adresa aplicabilă formei reale; nu inventa o adresă și nu o înlocui cu aria comercială. |
| `LEGAL_REGISTRATION_NUMBER`, `LEGAL_TAX_ID` | Completează datele aplicabile. Pentru operator de tip `legal` gate-ul cere ambele. |
| `LEGAL_LAST_UPDATED` | Data revizuirii informării, în format ISO `YYYY-MM-DD`. |
| `LEGAL_CONTACT_EMAIL` | Adresa reală pentru solicitări privind datele. |
| `LEGAL_REQUEST_BASIS`, `LEGAL_SECURITY_BASIS` | Temeiurile stabilite pentru răspuns și securitate; nu copia automat o bază generică. |
| `LEGAL_RETENTION_POLICY` | Practica aprobată pentru solicitări, mailbox și loguri. |
| `LEGAL_PROCESSORS_POLICY` | Furnizori, roluri, locații și mecanisme de transfer verificate. |
| `LEGAL_STORAGE_POLICY` | Tehnologiile și stocarea confirmate prin auditul implementării. |
| `LEGAL_REVIEWED` | `true` după revizuirea informărilor față de operator și practica efectivă. |
| `RELEASE_APPROVED` | `true` numai după verificările obligatorii și aprobarea explicită a proprietarului. |
| `MAILBOX_TESTED` | Pentru varianta actuală: `true` după ce linkul deschide mesajul pregătit și proprietarul face o trimitere controlată, primită în inbox-ul real. |
| `CONTACT_ENABLED`, `NEXT_PUBLIC_CONTACT_ENABLED` | Ambele rămân `false`. Nu le activa pentru homepage-ul actual. |
| `CONTACT_ALLOWED_ORIGINS` | Liste explicite de origins separate prin virgulă; în producție trebuie să fie numai `https://santiersync.ro`. Fără wildcard. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Lista explicită de hostnames pentru widget; în producție trebuie să fie numai `santiersync.ro`. Fără wildcard, port sau scheme. |
| `CONTACT_TO_EMAIL` | Destinatarul real al mesajelor; publicul cunoaște adresa inițială `santiersync@gmail.com`, dar livrarea și monitorizarea trebuie testate. |
| `CONTACT_FROM_EMAIL` | Expeditor de pe `santiersync.ro` sau un subdomeniu al acestuia, după verificarea domeniului în Resend. |
| `RESEND_API_KEY` | Secret server-only pentru Resend. Creează chei separat pentru medii și respectă limitele curente din [Resend pricing](https://resend.com/pricing). |
| `TURNSTILE_SECRET_KEY` | Secret server-only pentru Cloudflare Turnstile. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cheia publică Turnstile; folosește widget și hostname configurate explicit. Vezi [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/). |
| `WAF_RATE_LIMIT_CONFIGURED` | `true` numai după configurarea și verificarea unei reguli de limitare pentru endpointul de contact în Vercel WAF. |
| `SENDER_DOMAIN_VERIFIED` | `true` numai după confirmarea domeniului expeditor în Resend. |

Gate-ul actual de producție verifică HTTPS/canonical-ul, aprobările, identitatea și câmpurile juridice, precum și proba mailbox-ului prin `mailto:`. `LEGAL_REVIEWED` și `RELEASE_APPROVED` sunt aprobări umane, nu rezultate deduse de aplicație. Cheile, hostname-urile, verificarea domeniului Resend și limita WAF aparțin integrării API viitoare și nu se declară configurate acum.

În preview-ul actual, testează numai pregătirea mesajului `mailto:` și trimiterea controlată de către proprietar. Nu activează formularul API, Resend, Turnstile sau WAF pentru această versiune. Dacă integrarea API va fi aprobată separat, folosește un widget Turnstile separat cu hostname-ul preview exact, cheia secretă reală a widgetului și un mailbox de test dedicat. Cheile dummy pot întoarce hostname/action dummy și nu dovedesc fluxul real; nu slăbi și nu ocoli validarea hostname/action ca să le accepți.

## Costuri și rollback

Brief-ul recomandă Vercel Pro pentru site comercial; prețurile și cotele se verifică direct în [documentația planului Pro](https://vercel.com/docs/plans/pro-plan). Dacă endpointul API va fi aprobat ulterior, recitește condițiile [Turnstile](https://developers.cloudflare.com/turnstile/plans/) și Resend înainte de activare. Setează alerte potrivite și păstrează ID-ul ultimului deployment verificat ca țintă de rollback. După rollback confirmă că pagina, legătura de email, metadatele și paginile legale corespund versiunii restaurate.
