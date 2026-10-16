# ȘantierSync

Website de prezentare pentru organizarea cererilor de ofertă la firme de construcții și instalații. Homepage-ul include un formular care trimite direct la API-ul proiectului când serviciile și credențialele sunt configurate. Contactul din producție rămâne dezactivat până la configurarea și verificarea credențialelor Resend și Turnstile; până atunci, vizitatorul primește adresa de e-mail ca alternativă.

## Dezvoltare

- Node.js 24.x (mediul proiectului folosește Node 24.14.1).
- Next.js 16.4.0, React 19.3.0 și TypeScript.
- Creează `.env.local` pornind de la `.env.example`; păstrează valorile goale/false pentru preview și nu introduce secrete în Git.
- Rulează `npm ci`, apoi `npm run dev` pentru serverul local.
- `npm run lint`, `npm run typecheck` și `npm run build` verifică proiectul. Build-ul rulează mai întâi controlul de lansare; acesta nu blochează build-ul local sau un preview.

`npm run start` pornește un build deja creat. `npm run check-release` verifică setările obligatorii doar în mediul Vercel Production. Pentru a verifica intenționat controlul fără deploy, setează `CHECK_PRODUCTION=true`; configurația incompletă trebuie să returneze eroare.

## Publicare

Domeniul canonic este `https://santiersync.ro`; `santiersync.com` este opțional pentru redirect după configurarea DNS-ului. Canonical-ul din producție trebuie să fie exact `https://santiersync.ro`. Indexarea publică cere `PUBLIC_INDEXING_ENABLED=true`, Vercel Production și acest URL exact. Preview-urile rămân `noindex`.

Importă repository-ul într-un proiect Vercel și folosește Node 24.x. Contactul trimite formularul direct la API numai când ambele flaguri și credențialele necesare sunt configurate; API-ul validează originea, honeypot-ul și tokenul Turnstile înainte de livrarea prin Resend. Până când credențialele reale și verificarea expeditorului sunt configurate, contactul de producție rămâne oprit și pagina oferă e-mailul ca alternativă. WAF poate fi adăugat separat, dar nu este o condiție a aplicației pentru activarea endpointului.

Publicarea live se blochează dacă lipsesc identitatea și datele aplicabile operatorului, temeiurile și practicile reale, revizuirea juridică, controlul domeniului, proba mailbox-ului ori aprobarea proprietarului. Identitatea și profilele rămân ascunse până la confirmarea proprietarului; nu completa valori presupuse și nu crea profile publice în numele său. Paginile juridice nu sunt publicate până când datele cerute sunt verificate.

Ghidurile de configurare, dependențe și testare sunt în [docs/CONFIGURARE.md](docs/CONFIGURARE.md), [docs/DEPENDENTE.md](docs/DEPENDENTE.md) și [docs/TESTARE-MANUALA.md](docs/TESTARE-MANUALA.md). Pașii Search Console sunt documentați, dar proprietatea nu a fost verificată și sitemap-ul nu a fost trimis. Raportul curent este [docs/LIVRARE-2026-10-17.md](docs/LIVRARE-2026-10-17.md). Păstrează un deployment anterior verificat pentru rollback; după rollback repetă verificarea paginii, fallback-ului de email, paginilor juridice și indexării.

Consentmanager autoblocking și integrarea directă GA4 sunt descrise în [docs/GA4.md](docs/GA4.md). Înainte de activare, proprietarul trebuie să confirme configurarea domeniului CMP, furnizorul Google Analytics `s26`, Google Consent Mode, setările fără reclame și dezactivarea „Enhanced measurement”; lista din ghid nu a fost încă verificată manual. Google Tag Manager și conversiile nu sunt configurate.

## Versiuni locale

Conținutul public se editează din instanța Sanity configurată pentru proiect, fără un deploy nou. Accesul Studio este privat; documentația nu expune conturi sau profile. Ghidul de editare, previzualizare și backup este în [docs/CMS-SANITY.md](docs/CMS-SANITY.md). Codul și macheta rămân în Git; backupurile conținutului CMS se păstrează separat, local.

Istoricul și regulile de lucru sunt descrise în [docs/VERSIUNI.md](docs/VERSIUNI.md). Textele anterioare redesignului sunt păstrate separat în [arhiva de conținut](docs/versiuni/v0.1-continut-original.md). Reperul `v0.2-design-referinta` salvează codul variantei actuale; nu reprezintă o lansare publică sau validarea manuală.

## Infrastructură și licențe

Verifică planul Vercel potrivit înainte de folosirea comercială. Cal.com, Google Calendar și registrul privat Google Sheets susțin rezervările când configurația de programare este activă. Resend și Cloudflare Turnstile susțin formularul de contact, dar contactul rămâne dezactivat în producție până la configurarea și verificarea credențialelor. Consentmanager și Google Analytics sunt condiționale și rămân dezactivate în etapa demo curentă. Costurile și termenii se pot schimba; surse oficiale: [prețuri Vercel](https://vercel.com/pricing), [prețuri Resend](https://resend.com/pricing), [planuri Turnstile](https://developers.cloudflare.com/turnstile/plans/).

Next.js și dependențele au licențele publicate de proiectele lor. Verifică licențele versiunilor exacte din `package-lock.json` înainte de distribuție și păstrează notificările pe care acestea le cer.
