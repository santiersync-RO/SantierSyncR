# Versiuni și puncte de revenire

Aceste repere sunt pentru a putea compara variantele fără să folosești comenzi sau să lucrezi cu Git.

## Repere

- **`v0.2-design-referinta`** — punctul local de cod pentru designul actual, commitul `d80f477`, salvat înaintea următoarei runde de schimbări.
- **`v0.1-continut-original.md`** — arhiva textului comercial recuperat din brief-ul inițial. Este doar conținut, nu o versiune completă de website și nu păstrează vechiul HTML sau CSS. Nu există un commit Git istoric v0.1.

## Sincronizare online

La 8 octombrie 2026, repository-ul public SantierSyncR de pe GitHub este încă nesincronizat; push-ul nu a fost făcut. Autentificarea prin browser/Git Credential Manager a reușit, iar autentificarea Vercel CLI confirmă contul `adriancomann`, echipa `coman-family` și planul Hobby. Proiectul Vercel SantierSyncR urmează să fie configurat. Nu au fost puse coduri OAuth ori URL-uri de autorizare în fișiere.

Există un bundle Git recuperabil la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`, verificat pentru tag-ul `v0.2-design-referinta` (`d80f477`) și checkpointul de documentație `a59`. Acesta este o copie locală separată; nu include fișiere `.env` sau `node_modules` și nu este o copie în afara calculatorului.

Etapa de hosting aleasă pentru demo-ul personal este Vercel Hobby; când proiectul se apropie de utilizarea cu clienți, proprietarul va reevalua trecerea la Pro. Setarea intenționată este descrisă în `VERCEL-DEMO.md`, dar deploy-ul nu este încă confirmat. Demo-ul păstrează copy-ul homepage-ului, `noindex`, răspuns 404 pentru paginile juridice draft, `mailto` activ și API-ul dezactivat.

După confirmarea build-ului demo, este planificat un reper nou cu tag-ul `v0.3-demo-vercel`. Tag-ul nu este încă creat.

## Cum lucrăm mai departe

Până când designul este clar, schimbările vor rămâne mici și cu puncte de control ușor de identificat. Pentru o propunere vizuală mai amplă putem lucra într-o ramură separată, ca să poți compara varianta nouă cu reperul actual înainte de a o păstra.

Verificarea manuală a aspectului și textelor rămâne la tine. Îți poți spune observațiile în limbaj obișnuit, de exemplu: „revino la designul de referință” sau „compară varianta aceasta cu v0.2”. Nu trebuie să deschizi terminalul sau să folosești Git.

## Unde sunt păstrate versiunile

Punctele de control sunt în Git local, în copia de lucru de pe acest calculator. Git local nu este o copie de rezervă în GitHub și nu sincronizează automat fișierele cu internetul. Push-ul către GitHub va necesita autorizare de scriere pentru contul potrivit. Dacă acest calculator sau directorul local se pierde, bundle-ul local nu înlocuiește o copie de rezervă în altă locație.
