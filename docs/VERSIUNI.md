# Versiuni și puncte de revenire

Aceste repere sunt pentru a putea compara variantele fără să folosești comenzi sau să lucrezi cu Git.

## Repere

- **`v0.2-design-referinta`** — punctul local de cod pentru designul actual, commitul `d80f477`, salvat înaintea următoarei runde de schimbări.
- **`v0.1-continut-original.md`** — arhiva textului comercial recuperat din brief-ul inițial. Este doar conținut, nu o versiune completă de website și nu păstrează vechiul HTML sau CSS. Nu există un commit Git istoric v0.1.

## Sincronizare online

La 8 octombrie 2026, repository-ul public SantierSyncR de pe GitHub este încă gol. Codul și tag-ul `v0.2-design-referinta` nu au fost încărcate acolo: contul GitHub conectat raportează că nu are drept de push, iar Git din terminal nu are credențiale disponibile. Încercarea de push fără autentificare a eșuat. Așadar, versiunea online nu este sincronizată cu cea locală.

Există un bundle Git recuperabil la `D:\AI\Codex\ȘantierSync\Backups\SantierSync-2026-10-08.bundle`, verificat pentru checkpointul `d80f477`. Acesta este o copie locală separată a codului comis, istoricului și tag-ului; nu include fișiere `.env` sau `node_modules` și nu este o copie în afara calculatorului.

## Cum lucrăm mai departe

Până când designul este clar, schimbările vor rămâne mici și cu puncte de control ușor de identificat. Pentru o propunere vizuală mai amplă putem lucra într-o ramură separată, ca să poți compara varianta nouă cu reperul actual înainte de a o păstra.

Verificarea manuală a aspectului și textelor rămâne la tine. Îți poți spune observațiile în limbaj obișnuit, de exemplu: „revino la designul de referință” sau „compară varianta aceasta cu v0.2”. Nu trebuie să deschizi terminalul sau să folosești Git.

## Unde sunt păstrate versiunile

Punctele de control sunt în Git local, în copia de lucru de pe acest calculator. Git local nu este o copie de rezervă în GitHub și nu sincronizează automat fișierele cu internetul. Push-ul către GitHub va necesita autorizare de scriere pentru contul potrivit. Dacă acest calculator sau directorul local se pierde, bundle-ul local nu înlocuiește o copie de rezervă în altă locație.
