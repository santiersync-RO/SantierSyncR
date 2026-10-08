# Versiuni și puncte de revenire

Aceste repere sunt pentru a putea compara variantele fără să folosești comenzi sau să lucrezi cu Git.

## Repere

- **`v0.2-design-referinta`** — punctul de cod pentru designul din capturile de referință, commitul `d80f477`.
- **`v0.3-demo-vercel`** — checkpoint intermediar de demo, commitul `cb0054a`.
- **`v0.3.1-demo-publicat`** — sursa deploy-ului demo curent, tag-ul indică commitul `2badb64`.
- **`v0.1-continut-original.md`** — arhiva textului comercial recuperat din brief-ul inițial. Este doar conținut, nu o versiune completă de website și nu păstrează vechiul HTML sau CSS. Nu există un commit Git istoric v0.1.

## Sincronizare online

Repository-ul public SantierSyncR este sincronizat în branch-urile `main` și `feat/website-mvp`. Codul aplicației din deploy rămâne `2badb64`. Tag-urile `v0.2-design-referinta`, `v0.3-demo-vercel` și `v0.3.1-demo-publicat` sunt toate pe remote, iar ultimul indică sursa deploy-ului curent. Actualizările ulterioare ale documentației nu schimbă codul demo-ului publicat.

Bundle-ul Git local este la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`. Se recreează și se verifică după salvarea checkpointului, cu branch-urile locale/remote și tag-urile. Nu include `.env` sau `node_modules` și nu este copie offsite.

Demo-ul personal este publicat în Vercel Hobby și Ready la https://santiersync.ro (alias Vercel: https://santiersync.vercel.app). Homepage-ul își păstrează copy-ul, are `noindex`, paginile juridice draft răspund 404, `mailto` este activ și API-ul este dezactivat. DNS-ul public, aliasul de producție și certificatul TLS au fost verificate; un HEAD prin DNS public a primit HTTP 200 și header noindex. Înainte de folosirea cu clienți, proprietarul va reevalua trecerea la Pro.

Integrarea GitHub–Vercel nu este încă activă: conectarea a primit eroarea API 400 deoarece integrarea GitHub necesară nu este instalată. Pentru repository-uri personale, Vercel cere proprietarul pentru conectare. Alegerea fluxului de publicare rămâne la proprietar.

## Cum lucrăm mai departe

Până când designul este clar, schimbările vor rămâne mici și cu puncte de control ușor de identificat. Pentru o propunere vizuală mai amplă putem lucra într-o ramură separată, ca să poți compara varianta nouă cu reperul actual înainte de a o păstra.

Verificarea manuală a aspectului și textelor rămâne la tine. Îți poți spune observațiile în limbaj obișnuit, de exemplu: „revino la designul de referință” sau „compară varianta aceasta cu v0.2”. Nu trebuie să deschizi terminalul sau să folosești Git.

## Unde sunt păstrate versiunile

Punctele de control sunt în Git local și în repository-ul sincronizat de pe GitHub. Git nu publică automat schimbările pe Vercel: deploy-urile se fac explicit prin CLI până când proprietarul decide dacă activează GitHub App. Bundle-ul local este o recuperare suplimentară, nu o copie offsite; dacă se pierde calculatorul, este necesar și un backup în altă locație.
