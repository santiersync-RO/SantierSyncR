# Versiuni și puncte de revenire

Aceste repere te ajută să compari variante fără să lucrezi direct cu Git. Git păstrează codul site-ului și configurarea CMS; textele publicate în Sanity sunt conținut separat și au backup separat.

## Repere

- **`v0.4.2-presentation`** — corecția Presentation și a titlului din editor, commit `df35206`; permite iframe-ul din `sanity.io` și `www.sanity.io` și asociază documentul paginii principale. Retestarea manuală aparține proprietarului.

- **`v0.4.1-sanity-preview`** — checkpointul CMS precedent, commit `303ce15`; permite previzualizarea din adresa oficială unde Sanity găzduiește panoul.

- **`v0.4-sanity-cms`** — codul CMS Sanity, Studio-ul și integrarea site-ului; commit `3f61f9c`. Tag-ul și commitul sunt publicate în GitHub pe `main` și `feat/sanity-cms`.
- **`feat/website-mvp`** — checkpointul vechi al aplicației website, commit `15ecadc`. Nu reprezintă codul CMS curent.
- **`v0.3.1-demo-publicat`** — versiunea demo precedentă, commit `2badb64`; deploy-ul său Vercel este păstrat pentru rollback.
- **`v0.3-demo-vercel`** — checkpoint intermediar de demo, commit `cb0054a`.
- **`v0.2-design-referinta`** — punctul de cod pentru designul din capturile de referință, commit `d80f477`.
- **`v0.1-continut-original.md`** — arhiva textului comercial recuperat din brief-ul inițial. Este doar conținut, nu o versiune completă de website și nu păstrează vechiul HTML sau CSS. Nu există un commit Git istoric v0.1.

## Starea publicării

Codul din `v0.4.2-presentation` este sincronizat cu GitHub și publicat cu status Ready la [URL-ul Vercel](https://santiersync-i9h4pgtw1-coman-family.vercel.app). Domeniul principal este [santiersync.ro](https://santiersync.ro), cu aliasul [santiersync.vercel.app](https://santiersync.vercel.app). HTTPS și răspunsul public HTTP 200 au fost verificate tehnic. Testarea manuală a interfeței rămâne la proprietar. Deploy-ul vechi `2badb64` rămâne disponibil pentru revenirea la `v0.3.1-demo-publicat`.

Deploy-ul automat GitHub–Vercel nu este activ deoarece aplicația Vercel pentru GitHub lipsește. Până la conectarea ei, actualizările de cod se publică explicit prin Vercel CLI. Publicarea conținutului Sanity este independentă de deploy-ul site-ului: după Publish, webhookul invalidează cache-ul, cu revalidare de rezervă la 60 de secunde.

Pentru starea curentă, domenii și fluxul de publicare, vezi [ONLINE-SINCRONIZARE.md](ONLINE-SINCRONIZARE.md). Pentru editarea conținutului, backupul și configurarea CMS, vezi [CMS-SANITY.md](CMS-SANITY.md).

## Bundle Git local

Bundle-ul Git de recuperare este la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08-CMS.bundle`. Se actualizează după salvarea acestor documente cu istoricul complet, branch-urile și tag-urile curente. Bundle-ul păstrează codul și documentația, nu datasetul CMS și nici secretele sau `node_modules`; backupul Sanity este separat în `D:\AI\Codex\ȘantierSync\Backups\Sanity\`. Bundle-ul local nu este o copie offsite.

## Cum lucrăm mai departe

Punctele de control sunt în Git local și în repository-ul sincronizat de pe GitHub. Git nu publică automat schimbările pe Vercel în configurația curentă. Verificarea manuală a interfeței și a conținutului rămâne la tine; poți cere în chat „revino la designul de referință” sau „compară varianta aceasta cu v0.2”. Nu trebuie să deschizi terminalul sau să folosești Git.
