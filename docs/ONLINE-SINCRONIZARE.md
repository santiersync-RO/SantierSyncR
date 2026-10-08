# Publicare și sincronizare online

## Situația de acum

Repository-ul public [SantierSyncR pe GitHub](https://github.com/santiersync-RO/SantierSyncR) are CMS-ul în commitul `3f61f9c`, tag `v0.4-sanity-cms`, publicat pe branch-urile `main` și `feat/sanity-cms`. Branch-ul `feat/website-mvp` rămâne checkpointul vechi `15ecadc`; nu este codul CMS curent. Tag-urile precedente `v0.2-design-referinta` (`d80f477`), `v0.3-demo-vercel` (`cb0054a`) și `v0.3.1-demo-publicat` (`2badb64`) rămân disponibile.

Versiunea `v0.4.2-presentation`, commit `df35206`, este publicată cu status Ready în proiectul Vercel `santiersync`, echipa `coman-family`, la [URL-ul curent](https://santiersync-i9h4pgtw1-coman-family.vercel.app). Domeniul principal este [santiersync.ro](https://santiersync.ro), cu aliasul [santiersync.vercel.app](https://santiersync.vercel.app). HTTPS, HTTP 200, încărcarea conținutului Sanity și protecția webhookului au fost verificate tehnic; verificarea manuală a interfeței rămâne la proprietar. Deploy-ul vechi `2badb64`, publicat ca `v0.3.1-demo-publicat`, este păstrat pentru rollback. Vezi și [dashboard-ul Vercel](https://vercel.com/coman-family/santiersync).

Deploy-urile automate GitHub–Vercel nu sunt active, deoarece Vercel App nu este conectată la repository. Până la conectarea aplicației de către proprietarul repository-ului, actualizările de cod se publică explicit prin Vercel CLI. Sanity publică textul independent de deploy-ul website-ului: Publish declanșează webhookul de invalidare a cache-ului, iar website-ul încearcă și revalidarea periodică după 60 de secunde, ca rezervă.

Bundle-ul Git local de recuperare este la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08-CMS.bundle`; istoricul complet se reîmprospătează după aceste actualizări de documentație. Bundle-ul păstrează codul, documentația, branch-urile și tag-urile, dar nu datasetul CMS, `.env`, secretele sau `node_modules`. Backupul CMS este separat în `D:\AI\Codex\ȘantierSync\Backups\Sanity\`; vezi [CMS-SANITY.md](CMS-SANITY.md). Bundle-ul local nu este backup offsite.

## Opțiuni de găzduire

| Variantă | Cost și potrivire | Git și preview |
|---|---|---|
| **Vercel Hobby** | Este preferința actuală a proprietarului pentru a începe fără abonament, dar utilizarea trebuie clarificată înainte de publicarea comercială. Vercel spune că Hobby este pentru uz personal și necomercial; exemplele de utilizare comercială includ publicitate și vânzarea unui produs sau serviciu. Un site al unei agenții care promovează servicii poate intra în această definiție. Verifică [regulile de utilizare corectă Hobby](https://vercel.com/docs/limits/fair-use-guidelines); nu presupunem că un site gratuit este automat eligibil. | Acceptă integrarea Git și preview-uri pentru branch-uri/PR-uri, la fel ca Pro. Limita de plan se referă la eligibilitatea utilizării, nu la fluxul de deploy. |
| **Vercel Pro** | Potrivirea cea mai directă pentru proiectul actual Next.js: păstrează API Route Handler-ul viitor, `next/image` și ruta OG fără adaptare de platformă. Pagina oficială afișează **20 USD/lună**, cu un credit de 20 USD pentru utilizare; taxele și consumul peste credit pot adăuga cost. Poate fi opțiunea potrivită dacă Vercel confirmă că site-ul agenției este utilizare comercială. Verifică [Vercel Pricing](https://vercel.com/pricing). | Conectat la GitHub, generează deploy-uri preview pentru schimbările din branch/PR și actualizează domeniul de producție doar pentru branch-ul ales ca production. Vezi [Vercel pentru GitHub](https://vercel.com/docs/git/vercel-for-github). |
| **Cloudflare Pages Free** | Poate reduce costul lunar dacă site-ul rămâne static. Proiectul actual ar cere adaptare: ruta API nefolosită trebuie scoasă sau tratată separat, iar optimizarea imaginilor Next trebuie configurată pentru hosting static. Cloudflare documentează, între altele, 500 build-uri/lună și maximum 20.000 fișiere pe planul Free; verifică [limitele curente](https://developers.cloudflare.com/pages/platform/limits/). | Are deploy-uri preview și aliasuri pentru branch-uri/PR-uri GitHub; consultă [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/). Domeniul de producție rămâne separat de preview-urile de branch. |

**Decizia actuală:** Vercel Hobby a fost folosit pentru demo-ul personal; versiunea CMS este publicată cu status Ready. Înainte de folosirea cu clienți sau promovarea comercială, proprietarul va reevalua termenii și va trece la Pro dacă este necesar. RoTLD este registrul domeniului `.ro`; nameserverele cerute trebuie setate în contul RoTLD. Contul Cloudflare al `.com` nu configurează automat DNS-ul `.ro`.

Configurația pentru demo este descrisă în [VERCEL-DEMO.md](VERCEL-DEMO.md). Mediul demo rămâne `noindex`; schimbarea CMS a metadatelor SEO nu elimină această regulă de publicare. Pașii Preview/Publish ai Studio-ului au nevoie de verificare manuală în browser.

## Pașii pentru sincronizare și domeniu

1. Proprietarul decide politica repo/cont Vercel; integrarea Git Vercel nu a reușit (API 400 la GitHub App) și necesită instalarea aplicației de către proprietarul repository-ului. Nu se presupun deploy-uri automate la push.
2. Deploy-ul curent are status Ready la [URL-ul său](https://santiersync-i9h4pgtw1-coman-family.vercel.app); HTTPS și HTTP 200 au fost verificate tehnic. URL-urile publice rămân [santiersync.ro](https://santiersync.ro) și aliasul [santiersync.vercel.app](https://santiersync.vercel.app). Deploy-ul anterior `2badb64` este păstrat pentru rollback.
3. Proprietarul verifică manual UI-ul și preview-ul după ce deployment-ul este confirmat, inclusiv desktop/mobil, text, linkuri și formular. Verificarea manuală nu a fost încă efectuată.
4. Publicarea de cod și publicarea conținutului CMS sunt separate. GitHub nu declanșează automat deploy-ul Vercel; Publish în Sanity actualizează conținutul prin webhook, cu revalidare de rezervă la 60 de secunde. Mediul demo păstrează `noindex`; un release comercial/live este separat.

## Cum se leagă localul, GitHub și site-ul

- **Local:** copia de pe acest calculator, unde se editează și se verifică schimbările.
- **GitHub:** `main` și `feat/sanity-cms` conțin codul CMS final `df35206` și documentația actualizată; `feat/website-mvp` rămâne la checkpointul vechi `15ecadc`.
- **Sanity:** documentul CMS și datasetul `production` conțin textele publicate separat de Git; backupurile CMS stau în `Backups/Sanity`.
- **Vercel:** deploy-ul curent are status Ready, cu URL `https://santiersync-i9h4pgtw1-coman-family.vercel.app`; deploy-ul anterior `2badb64` este punctul de rollback.
- **Domenii:** URL-ul principal este `https://santiersync.ro`, iar aliasul `https://santiersync.vercel.app` este păstrat.
- **Deploy automat:** aplicația Vercel pentru GitHub nu este conectată; codul se publică prin CLI până la configurarea integrării.
- **Live comercial:** etapă separată, cu release gate și plan de hosting reevaluate înainte de clienți.

O editare locală sau un push în GitHub nu publică automat cod nou pe Vercel. Deploy-urile de cod se fac explicit prin CLI până când Vercel App este conectată. Conținutul CMS se publică din Studio fără un redeploy de cod; webhookul actualizează cache-ul, cu fallback la 60 de secunde. Proprietarul verifică manual interfața și previzualizarea. Dacă integrarea Git este activată ulterior, `main` poate deveni branch-ul de producție, iar branch-urile de lucru pot primi preview-uri.

Pentru întoarcere sau comparație poți cere în chat: „revino la `v0.2-design-referinta`” sau „compară designul nou cu `v0.2-design-referinta`”. Nu trebuie să folosești terminalul. Bundle-ul local este o recuperare suplimentară, nu o copie externă.
