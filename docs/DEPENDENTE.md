# Dependențe și servicii externe

Situația acestui ghid este cea din 17 octombrie 2026. Nu include credențiale, identificatori de cont, linkuri către profile sau date personale. Secretele se introduc direct în managerul de mediu al serviciului sau în `.env.local`, niciodată în repository.

## Runtime și cod

| Componentă | Rol | Configurare |
|---|---|---|
| Node.js 24.x | Runtime pentru Next.js și scripturile repository-ului. | Versiunea este indicată în `package.json` și folosită pentru deploy. |
| Next.js 16, React 19, TypeScript | Website, route handlers, metadata, sitemap și robots. | Dependențe fixate în `package-lock.json`; folosește `npm ci`. |
| Sanity | Conținutul paginilor și previzualizarea editorului. | `SANITY_PROJECT_ID`, `SANITY_DATASET`, token server-side pentru preview și secret webhook când integrarea e folosită. Accesul Studio rămâne privat. |

## Furnizori pentru funcții

| Furnizor/serviciu | Rol în aplicație | Stare/condiții |
|---|---|---|
| Vercel | Hosting și variabile per mediu. | Preview trebuie păstrat protejat; `noindex` nu oferă control de acces. Producția folosește URL-ul canonic `https://santiersync.ro`. |
| Cal.com și Google Calendar | Calendarul de rezervări și sincronizarea disponibilității/invitațiilor. | Programarea apare numai dacă `BOOKING_ENABLED` și întregul set de configurare sunt valide. |
| Google Apps Script și un fișier privat Google Sheets | Primește evenimentele Cal.com validate și păstrează registrul programărilor. | Endpointul este semnat și separat de linkul/permisiunile fișierului; fișierul rămâne privat. Configurarea și rotația se fac după ghidurile programărilor. |
| Resend | Livrarea solicitărilor trimise prin contact API. | Contactul de producție rămâne oprit până la credențiale reale, e-mailuri valide și domeniu expeditor verificat. Cheia `RESEND_API_KEY` este server-only. |
| Cloudflare Turnstile | Protecție anti-abuz pentru formularul de contact. | Cheile, hostname-ul și action-ul `contact` trebuie să corespundă mediului; serverul validează tokenul. Honeypot-ul este o măsură suplimentară din formular. |
| Vercel WAF | Poate adăuga o limită suplimentară pentru endpoint. | Opțional; nu este condiție de activare în configurația aplicației. Nu declara o regulă configurată fără probă în cont. |
| Consentmanager și Google Analytics 4 | CMP și statistici cu consimțământ. | Active numai în configurația live; `DEPLOYMENT_STAGE=demo` le ține dezactivate în producție. Google Analytics nu este configurat pentru publicitate. Google Tag Manager nu este folosit. |
| Google Search Console | Rapoarte de indexare, sitemap și performanță. | Pașii de configurare sunt documentați în raportul de livrare; proprietatea și sitemap-ul nu au fost trimise/verificate în această rundă. |

## Contact API: condiții de activare

Contactul din producție trebuie să rămână oprit cât timp credențialele sunt în curs de pregătire. Activarea cere ambele flaguri `CONTACT_ENABLED` și `NEXT_PUBLIC_CONTACT_ENABLED`, credențiale Resend și Turnstile, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, originea exactă `https://santiersync.ro`, hostname-ul `santiersync.ro` și `SENDER_DOMAIN_VERIFIED=true` numai după confirmarea reală a domeniului. Aplicația verifică tokenul Turnstile înainte de a solicita livrarea la Resend. În lipsa configurației, endpointul refuză trimiterea, iar UI arată e-mailul alternativ.

Un registru privat pentru mesajele de contact este opțional și cere separat `CONTACT_REGISTRY_ENABLED=true` și `CONTACT_REGISTRY_VERIFIED=true`, pe lângă endpointul și secretul registry configurate. Aceste flaguri nu activează contactul singure.

Nu adăuga un secret sau un flag doar pentru a trece release checker-ul. O probă de succes trebuie să folosească un mesaj controlat, un inbox monitorizat și confirmarea răspunsului furnizorului. WAF este suplimentar; un flag `WAF_RATE_LIMIT_CONFIGURED` fără regulă reală nu dovedește protecție.

Pentru operarea rezervărilor și a registrului, vezi [PROGRAMARI-CALCOM.md](PROGRAMARI-CALCOM.md), [REGISTRU-SOLICITARI.md](REGISTRU-SOLICITARI.md) și [GA4.md](GA4.md).
