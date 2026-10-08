# Versiuni și puncte de revenire

Aceste repere sunt pentru a putea compara variantele fără să folosești comenzi sau să lucrezi cu Git.

## Repere

- **`v0.2-design-referinta`** — punctul de cod pentru designul din capturile de referință, commitul `d80f477`.
- **`v0.3-demo-vercel`** — checkpoint intermediar de demo, commitul `cb0054a`.
- **`v0.3.1-demo-publicat`** — sursa deploy-ului demo curent, tag-ul indică commitul `2badb64`.
- **`v0.1-continut-original.md`** — arhiva textului comercial recuperat din brief-ul inițial. Este doar conținut, nu o versiune completă de website și nu păstrează vechiul HTML sau CSS. Nu există un commit Git istoric v0.1.

## Sincronizare online

Repository-ul public SantierSyncR este sincronizat în branch-urile `main` și `feat/website-mvp`. Tag-urile păstrează sursele fiecărui reper; `v0.3.1-demo-publicat` indică exact codul demo-ului publicat (`2badb64`). Actualizările ulterioare ale documentației nu schimbă acest cod.

Bundle-ul Git local este la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`. Se recreează și se verifică după salvarea fiecărui checkpoint. Nu include `.env` sau `node_modules` și nu este copie offsite.

Demo-ul personal este publicat în Vercel Hobby și Ready la https://santiersync.vercel.app. Homepage-ul își păstrează copy-ul, are `noindex`, paginile juridice draft răspund 404, `mailto` este activ și API-ul este dezactivat. Domeniul `santiersync.ro` este adăugat la proiect, dar DNS-ul public este NXDOMAIN până la configurarea nameserverelor Vercel în RoTLD. Aliasul de producție `.ro` încă nu este atașat deploy-ului; după DNS va trebui atașat sau făcut redeploy. Înainte de folosirea cu clienți, proprietarul va reevalua trecerea la Pro.

Integrarea GitHub–Vercel nu este încă activă: conectarea a primit eroarea API 400 deoarece integrarea GitHub necesară nu este instalată. Pentru repository-uri personale, Vercel cere proprietarul pentru conectare. Alegerea fluxului de publicare rămâne la proprietar.

## Cum lucrăm mai departe

Până când designul este clar, schimbările vor rămâne mici și cu puncte de control ușor de identificat. Pentru o propunere vizuală mai amplă putem lucra într-o ramură separată, ca să poți compara varianta nouă cu reperul actual înainte de a o păstra.

Verificarea manuală a aspectului și textelor rămâne la tine. Îți poți spune observațiile în limbaj obișnuit, de exemplu: „revino la designul de referință” sau „compară varianta aceasta cu v0.2”. Nu trebuie să deschizi terminalul sau să folosești Git.

## Unde sunt păstrate versiunile

Punctele de control sunt în Git local, în copia de lucru de pe acest calculator. Git local nu este o copie de rezervă în GitHub și nu sincronizează automat fișierele cu internetul. Push-ul către GitHub va necesita autorizare de scriere pentru contul potrivit. Dacă acest calculator sau directorul local se pierde, bundle-ul local nu înlocuiește o copie de rezervă în altă locație.
