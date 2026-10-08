# Status tehnic — 8 octombrie 2026

Versiunea locală este pregătită pentru prima rundă de feedback a proprietarului. Domeniul principal ales este santiersync.ro; DNS-ul și conturile de hosting nu sunt raportate drept configurate.

## Implementat

- Homepage-ul reproiectat după macheta aprobată: șase secțiuni, fără bloc FAQ și fără ofertă separată de website.
- Header cu logo raster orizontal, meniu „Ce facem”, „Cum lucrăm”, „Despre noi” și CTA „Hai să vorbim”; disclosure-ul mobil permite Escape și readuce focusul pe buton.
- Footer în două rânduri cu sloganul, link `mailto:`, anul 2026, locația, revenirea sus și motto-ul aprobat. Linkurile legale apar doar pe paginile legale.
- Contactul din homepage pregătește un mesaj `mailto:santiersync@gmail.com`; site-ul nu îl trimite și nu confirmă livrarea.
- Codul unui endpoint API de contact rămâne nelegat de homepage și dezactivat, pentru o etapă viitoare. Nu este raportat drept configurat sau testat.
- Logo-ul original este folosit ca raster, fără redesenare sau pretinderea unui format vectorial.
- Pagini juridice de lucru, metadate, imagine pentru distribuirea linkului, robots/sitemap condiționate de aprobarea lansării, 404 și headers de securitate.
- Control de build care blochează producția incomplet configurată și documentație de configurare/testare manuală.

## Verificări automate executate

- `npm run lint`, `npm run typecheck` și `npm run build`: trec pentru redesignul curent, inclusiv header, footer și contact.
- Controlul lansării a trecut trei probe automate în procese separate, cu configurații temporare: blochează datele incomplete, acceptă configurația mailto completă fără chei API și respinge activarea API-ului anterior. Configurațiile de probă nu au fost salvate și nu reprezintă aprobarea unei publicări.
- `npm audit --omit=dev`: nicio vulnerabilitate raportată în dependențele de producție la momentul verificării.

Auditul complet raportează cinci alerte high în lanțul de instrumente de dezvoltare `eslint-config-next → fast-glob → micromatch → braces`, pornind de la aceeași problemă a bibliotecii braces. Ultima versiune braces disponibilă verificată este 3.0.3, încă în intervalul afectat. Nu s-a aplicat `npm audit fix --force`, care propune un downgrade major al configurației Next.js. Linterul este fixat la versiunea 9.39.5 compatibilă cu pluginurile actuale; versiunea 10 verificată produce conflicte de peer dependencies. Aceste limitări ale toolchain-ului trebuie reanalizate când apar versiuni corectate. Sursa alertei: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm.

## Verificări care aparțin proprietarului

Testarea vizuală și manuală a redesignului nu a fost efectuată de orchestrator sau de subagenți. Începe cu secțiunea „Prima rundă — versiunea locală” din `TESTARE-MANUALA.md`; restul checklistului aparține etapelor ulterioare. Scoruri Lighthouse, probe pe telefoane și testarea cititorului de ecran nu sunt declarate ca verificate.

Linkul `mailto:` doar deschide un mesaj în aplicația vizitatorului. Confirmarea unei livrări reale nu este raportată acum. Endpointul API, Turnstile, Resend și WAF rămân pentru o integrare viitoare, care nu este activată în homepage.

Statusul nu reprezintă certificare de securitate sau validare manuală. Codul a fost revizuit de orchestrator; limitele de mai sus sunt păstrate explicit pentru preluare.
