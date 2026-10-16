# Configurare

Acest ghid este pentru proprietarul proiectului. Nu trimite parole sau tokenuri în conversații, issue-uri sau cod. Adaugă secretele direct în Vercel Environment Variables și păstrează fișierele `.env.local` în afara Git.

## Domeniu și hosting

1. Domeniul canonic confirmat este `santiersync.ro` (ASCII, fără diacritice). Configurează `https://santiersync.ro` în Vercel și verifică DNS-ul și certificatul TLS. `santiersync.com` poate fi adăugat ulterior ca redirect după configurarea DNS.
2. Setează Node.js 24.x pentru Development, Preview și Production.
3. Păstrează preview-ul protejat prin controalele de acces ale proiectului. `noindex` și `robots.txt` reduc indexarea, dar nu protejează conținutul privat.
4. Înainte de folosirea comercială, confirmă planul Vercel potrivit, limitele și alertele de cost. Verifică prețurile actuale în [pagina Vercel](https://vercel.com/pricing); nu presupune că utilizarea suplimentară este inclusă.

## Variabile și valori

`.env.example` conține numele variabilelor și nu are secrete reale. Copiază-l în `.env.local` doar pentru dezvoltare. În Vercel setează separat valorile pentru fiecare mediu. Homepage-ul are un formular care postează direct la endpointul contact API și afișează e-mailul public ca alternativă. Contactul API rămâne dezactivat în producție până când credențialele Resend și Turnstile și verificarea domeniului expeditor sunt completate și probate.

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
| `MAILBOX_TESTED` | `true` numai după confirmarea adresei publice de e-mail și a unei trimiteri de probă făcute manual și primite în inbox-ul real. Un răspuns API de succes nu înlocuiește această probă. |
| `CONTACT_ENABLED`, `NEXT_PUBLIC_CONTACT_ENABLED` | Ambele trebuie să fie `true` împreună cu credențialele și protecțiile configurate; până atunci lasă-le `false`. Gate-ul demo acceptă contactul doar dacă setările sunt complete; gate-ul live cere în continuare aprobările și verificările legale. |
| `CONTACT_ALLOWED_ORIGINS` | Liste explicite de origins separate prin virgulă; în producție trebuie să fie numai `https://santiersync.ro`. Fără wildcard. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Lista explicită de hostnames pentru widget; în producție trebuie să fie numai `santiersync.ro`. Fără wildcard, port sau scheme. |
| `CONTACT_TO_EMAIL` | Destinatarul real al mesajelor; publicul cunoaște adresa inițială `santiersync@gmail.com`, dar livrarea și monitorizarea trebuie testate. |
| `CONTACT_FROM_EMAIL` | Expeditor de pe `santiersync.ro` sau un subdomeniu al acestuia, după verificarea domeniului în Resend. |
| `RESEND_API_KEY` | Secret server-only pentru Resend. Creează chei separat pentru medii și respectă limitele curente din [Resend pricing](https://resend.com/pricing). |
| `TURNSTILE_SECRET_KEY` | Secret server-only pentru Cloudflare Turnstile. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cheia publică Turnstile; folosește widget și hostname configurate explicit. Vezi [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/). |
| `WAF_RATE_LIMIT_CONFIGURED` | Opțional: evidență pentru o regulă suplimentară în Vercel WAF. Aplicația nu cere acest flag pentru endpoint. |
| `SENDER_DOMAIN_VERIFIED` | `true` numai după confirmarea domeniului expeditor în Resend. |

Gate-ul de producție verifică HTTPS/canonical-ul, aprobările, identitatea și câmpurile juridice, precum și proba mailbox-ului. `LEGAL_REVIEWED` și `RELEASE_APPROVED` sunt aprobări umane, nu rezultate deduse de aplicație. Pentru contactul API, configurează credențiale reale Resend și Turnstile, e-mailuri reale, originea exactă `https://santiersync.ro`, hostname-ul exact `santiersync.ro` și `SENDER_DOMAIN_VERIFIED=true` numai după verificarea expeditorului. WAF este o protecție suplimentară opțională, nu un gate al aplicației.

În preview, contactul API rămâne oprit până când există chei reale și hostname/origin exact configurate pentru acel mediu. Nu reutiliza cheile Production și nu accepta hostname-uri dummy: verificarea Turnstile cere acțiunea `contact` și hostname-ul aprobat. Pentru testarea unei livrări, folosește un inbox de test controlat. WAF poate fi configurat suplimentar, dar nu este necesar pentru endpoint.

## Costuri și rollback

Verifică prețurile și cotele curente pentru hosting și furnizorii integrați înainte de folosire comercială. Setează alerte potrivite și păstrează ID-ul ultimului deployment verificat ca țintă de rollback. După rollback confirmă că pagina, fallback-ul de e-mail, metadatele și paginile juridice corespund versiunii restaurate.
