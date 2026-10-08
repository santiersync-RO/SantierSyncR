# Status tehnic — 8 octombrie 2026

Demo-ul personal este online și Ready în Vercel Hobby, echipa `coman-family`, la https://santiersync.ro (alias Vercel: https://santiersync.vercel.app). DNS-ul public indică nameserverele Vercel; Vercel raportează domeniul configurat corect, aliasul exact este atașat deploy-ului, iar certificatul TLS a fost emis. HEAD prin DNS public a returnat HTTP 200 și `X-Robots-Tag: noindex, nofollow, noarchive`. Repository-ul GitHub este sincronizat, dar integrarea Git automată a rămas neconfigurată după eroarea API 400 la GitHub App și decizia proprietarului este încă în așteptare.

## Implementat

- Homepage-ul reproiectat după macheta aprobată: șase secțiuni, fără bloc FAQ și fără ofertă separată de website.
- Header cu logo raster orizontal, meniu „Ce facem”, „Cum lucrăm”, „Despre noi” și CTA „Hai să vorbim”; disclosure-ul mobil permite Escape și readuce focusul pe buton.
- Footer în două rânduri cu sloganul, link `mailto:`, anul 2026, locația, revenirea sus și motto-ul aprobat. Linkurile legale apar doar pe paginile legale.
- Contactul din homepage pregătește un mesaj `mailto:santiersync@gmail.com`; site-ul nu îl trimite și nu confirmă livrarea.
- Codul unui endpoint API de contact rămâne nelegat de homepage și dezactivat, pentru o etapă viitoare. Nu este raportat drept configurat sau testat.
- Logo-ul original este folosit ca raster, fără redesenare sau pretinderea unui format vectorial.
- Pagini juridice de lucru, metadate, imagine pentru distribuirea linkului, robots/sitemap condiționate de aprobarea lansării, 404 și headers de securitate.
- Control de build care blochează producția incomplet configurată și documentație de configurare/testare manuală.
- Etapa de demo poate fi selectată explicit prin `DEPLOYMENT_STAGE=demo`: păstrează textul homepage-ului, `noindex`, 404 pentru paginile juridice draft, `mailto` activ și API-ul dezactivat. Setările ghidate sunt pentru Preview și Production; acest gate tehnic nu validează planul hostingului, DNS-ul sau verificarea manuală.
- Demo-ul Vercel este pe [URL-ul principal](https://santiersync.ro), cu [alias Vercel](https://santiersync.vercel.app), [deploy curent](https://santiersync-mlmao3k8w-coman-family.vercel.app) și [dashboard](https://vercel.com/coman-family/santiersync). Cele patru variabile de demo sunt setate pe Preview și Production; Node 24, `npm ci` și `npm run build` sunt configurate. Build-ul cloud și TypeScript au trecut.
- DNS-ul `santiersync.ro` este verificat prin rezolvatoarele publice 1.1.1.1 și 8.8.8.8; nameserverele `ns1.vercel-dns.com` și `ns2.vercel-dns.com` sunt active. Domeniul este verificat de Vercel, aliasul `.ro` atașat și certificatul TLS emis. Proba HTTP HEAD a primit 200 cu TLS valid și noindex.
- Lansarea comercială/live este o etapă separată și necesită date reale și aprobări legale, plus reevaluarea planului înainte de folosirea cu clienți.

## Verificări automate executate

- `npm run lint`, `npm run typecheck` și `npm run build`: trec pentru codul curent, inclusiv build-ul cloud Vercel și TypeScript.
- Controlul lansării a trecut patru probe automate în procese separate, cu configurații temporare; probele sunt distincte de build și nu reprezintă aprobarea unei publicări.
- `npm audit --omit=dev`: nicio vulnerabilitate raportată în dependențele de producție la momentul verificării.

Auditul complet raportează cinci alerte high în lanțul de instrumente de dezvoltare `eslint-config-next → fast-glob → micromatch → braces`, pornind de la aceeași problemă a bibliotecii braces. Ultima versiune braces disponibilă verificată este 3.0.3, încă în intervalul afectat. Nu s-a aplicat `npm audit fix --force`, care propune un downgrade major al configurației Next.js. Linterul este fixat la versiunea 9.39.5 compatibilă cu pluginurile actuale; versiunea 10 verificată produce conflicte de peer dependencies. Aceste limitări ale toolchain-ului trebuie reanalizate când apar versiuni corectate. Sursa alertei: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm.

## Verificări care aparțin proprietarului

Testarea vizuală/manuală a demo-ului nu a fost efectuată; aparține proprietarului și se poate face la https://santiersync.ro. Începe cu secțiunea „Prima rundă — versiunea locală” din `TESTARE-MANUALA.md`; restul checklistului aparține etapelor ulterioare. Scoruri Lighthouse, probe pe telefoane și testarea cititorului de ecran nu sunt declarate ca verificate.

Linkul `mailto:` doar deschide un mesaj în aplicația vizitatorului. Confirmarea unei livrări reale nu este raportată acum. Endpointul API, Turnstile, Resend și WAF rămân pentru o integrare viitoare, care nu este activată în homepage.

Statusul nu reprezintă certificare de securitate sau validare manuală. Codul a fost revizuit de orchestrator; limitele de mai sus sunt păstrate explicit pentru preluare.
