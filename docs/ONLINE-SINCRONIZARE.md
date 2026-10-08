# Publicare și sincronizare online

## Situația de acum

Codul este sincronizat pe repository-ul public [SantierSyncR pe GitHub](https://github.com/santiersync-RO/SantierSyncR), în branch-urile `main` și `feat/website-mvp`. Reperele sunt `v0.2-design-referinta` (`d80f477`), `v0.3-demo-vercel` (`cb0054a`) și `v0.3.1-demo-publicat` (`2badb64`, sursa deploy-ului curent). Actualizările ulterioare ale documentației nu schimbă codul demo-ului publicat.

Demo-ul este publicat cu status **Ready** pe proiectul Vercel `santiersync`, în echipa `coman-family` (plan Hobby). [URL stabil](https://santiersync.vercel.app) · [deploy-ul curent](https://santiersync-mlmao3k8w-coman-family.vercel.app) · [dashboard](https://vercel.com/coman-family/santiersync). Build-ul cloud a trecut, inclusiv TypeScript. Domeniul `santiersync.ro` este adăugat la proiect, dar DNS-ul public este încă NXDOMAIN, iar nameserverele nu sunt configurate; Vercel cere `ns1.vercel-dns.com` și `ns2.vercel-dns.com`. Aliasul de producție `.ro` încă nu este atașat la deploy; după DNS va trebui atașat sau făcut un redeploy. HTTPS și servirea prin `.ro` nu sunt confirmate.

Autentificarea GitHub și Vercel este pregătită. Conectarea Git a primit eroarea API 400: integrarea GitHub necesară nu este instalată. Vercel cere proprietarul repository-ului personal pentru conectare, împreună cu aplicația GitHub autorizată ([Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github), [instalarea aplicației](https://github.com/apps/vercel)). Proprietarul încă decide între păstrarea repository-ului cu publicări controlate, configurarea Vercel prin contul proprietar `santiersync-RO` sau transferul repository-ului către `adriancomann`; deploy-urile automate nu sunt active.

Există o copie Git locală separată la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`. Bundle-ul se recreează și se verifică după salvarea checkpointului și a documentației; păstrează istoricul comis și tag-urile, fără `.env`, secrete sau `node_modules`. Fișierul este tot pe acest calculator, deci nu este backup offsite.

## Opțiuni de găzduire

| Variantă | Cost și potrivire | Git și preview |
|---|---|---|
| **Vercel Hobby** | Este preferința actuală a proprietarului pentru a începe fără abonament, dar utilizarea trebuie clarificată înainte de publicarea comercială. Vercel spune că Hobby este pentru uz personal și necomercial; exemplele de utilizare comercială includ publicitate și vânzarea unui produs sau serviciu. Un site al unei agenții care promovează servicii poate intra în această definiție. Verifică [regulile de utilizare corectă Hobby](https://vercel.com/docs/limits/fair-use-guidelines); nu presupunem că un site gratuit este automat eligibil. | Acceptă integrarea Git și preview-uri pentru branch-uri/PR-uri, la fel ca Pro. Limita de plan se referă la eligibilitatea utilizării, nu la fluxul de deploy. |
| **Vercel Pro** | Potrivirea cea mai directă pentru proiectul actual Next.js: păstrează API Route Handler-ul viitor, `next/image` și ruta OG fără adaptare de platformă. Pagina oficială afișează **20 USD/lună**, cu un credit de 20 USD pentru utilizare; taxele și consumul peste credit pot adăuga cost. Poate fi opțiunea potrivită dacă Vercel confirmă că site-ul agenției este utilizare comercială. Verifică [Vercel Pricing](https://vercel.com/pricing). | Conectat la GitHub, generează deploy-uri preview pentru schimbările din branch/PR și actualizează domeniul de producție doar pentru branch-ul ales ca production. Vezi [Vercel pentru GitHub](https://vercel.com/docs/git/vercel-for-github). |
| **Cloudflare Pages Free** | Poate reduce costul lunar dacă site-ul rămâne static. Proiectul actual ar cere adaptare: ruta API nefolosită trebuie scoasă sau tratată separat, iar optimizarea imaginilor Next trebuie configurată pentru hosting static. Cloudflare documentează, între altele, 500 build-uri/lună și maximum 20.000 fișiere pe planul Free; verifică [limitele curente](https://developers.cloudflare.com/pages/platform/limits/). | Are deploy-uri preview și aliasuri pentru branch-uri/PR-uri GitHub; consultă [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/). Domeniul de producție rămâne separat de preview-urile de branch. |

**Decizia actuală:** Vercel Hobby este folosit pentru demo-ul personal; înainte de folosirea cu clienți sau promovarea comercială, proprietarul va reevalua termenii și va trece la Pro dacă este necesar. RoTLD este registrul domeniului `.ro`; nameserverele cerute trebuie setate în contul RoTLD. Contul Cloudflare al `.com` nu configurează automat DNS-ul `.ro`.

Configurația pentru demo este descrisă în [VERCEL-DEMO.md](VERCEL-DEMO.md): cele patru variabile demo sunt setate pentru Production și Preview. Homepage-ul își păstrează copy-ul; demo-ul rămâne `noindex`, rutele juridice draft răspund cu 404, formularul `mailto` este activ, iar API-ul este dezactivat. Verificarea manuală a interfeței aparține proprietarului și nu a fost încă făcută.

## Pașii pentru sincronizare și domeniu

1. Proprietarul decide politica repo/cont Vercel; integrarea Git Vercel necesită ca owner-ul repository-ului să instaleze Vercel GitHub App. Până la acea alegere, nu se presupun deploy-uri automate la push.
2. Pentru domeniul `.ro`, setează în RoTLD nameserverele `ns1.vercel-dns.com` și `ns2.vercel-dns.com`, apoi așteaptă propagarea și verifică DNS/HTTPS. Domeniul este adăugat proiectului, dar acum răspunde NXDOMAIN.
3. Proprietarul verifică manual UI-ul pe [URL-ul stabil de demo](https://santiersync.vercel.app), inclusiv desktop/mobil, text, linkuri și comportamentul formularului. Această verificare nu a fost încă efectuată.
4. Demo-ul este online pe `vercel.app`, dar lansarea comercială/live rămâne separată și blocată până la completarea și aprobarea datelor operatorului și informărilor reale, plus reevaluarea planului Vercel.

## Cum se leagă localul, GitHub și site-ul

- **Local:** copia de pe acest calculator, unde se editează și se verifică schimbările.
- **GitHub:** repository-ul sincronizat; cele două branch-uri de lucru menționate mai sus indică același commit curent.
- **Demo Vercel:** deploy-ul `vercel.app` este online, fără integrare Git automată.
- **Domeniul `.ro`:** adăugat în proiect, încă nefuncțional până la configurarea nameserverelor și propagarea DNS.
- **Live comercial:** etapă separată, cu release gate și plan de hosting reevaluate înainte de clienți.

O editare locală sau un push în GitHub nu modifică automat demo-ul online în configurația actuală. Publicarea curentă se face explicit prin Vercel CLI, din versiunea salvată în GitHub, după verificarea manuală de către proprietar. Dacă integrarea Git este activată ulterior, `main` poate deveni branch-ul de producție, iar branch-urile de lucru pot primi preview-uri.

Pentru întoarcere sau comparație poți cere în chat: „revino la `v0.2-design-referinta`” sau „compară designul nou cu `v0.2-design-referinta`”. Nu trebuie să folosești terminalul. Bundle-ul local este o recuperare suplimentară, nu o copie externă.
