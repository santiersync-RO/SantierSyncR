# Programări prin Cal.com

Ghidul descrie configurarea evenimentului și activarea legăturii Cal.com → site → registrul privat. Este destinat proprietarului proiectului. Nu copia chei, URL-uri private, date de autentificare sau date ale invitaților în documente publice, conversații ori Git.

## Starea configurării

La 13 octombrie 2026, profilul Cal.com `santiersyncro` are evenimentul gratuit de 30 de minute `https://cal.com/santiersyncro/30min`, cu titlul „Discuție inițială — ȘantierSync”. ID-ul evenimentului rămâne în configurația privată. Descrierea evenimentului este salvată. Întrebările native au fost salvate și verificate prin API-ul public al evenimentului:

| Câmp | Setare confirmată |
|---|---|
| `gestionare_cereri` | Obligatoriu; „Cum gestionați acum cererile?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| `blocaj_timp` | Obligatoriu; „Unde pierdeți cel mai mult timp?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| Firmă | Opțional |

Evenimentul folosește programul curent din Cal.com: luni–vineri, 09:00–17:00, fusul `Europe/Bucharest`; weekendurile sunt indisponibile. Calendarul Google este conectat, iar adăugarea evenimentelor este activată. Nu s-a testat dacă evenimentul este blocat efectiv de conflictele calendarului. Orele nu au fost modificate. Confirmările native Cal.com rămân singurele notificări automate cerute; nu sunt configurate notificări SMS, un CRM sau o campanie de email.

Registrul privat este creat, iar codul Apps Script și proprietățile private sunt salvate. Foaia este deținută de proprietarul contului personal; contul agenției are acces de editor. Autorizarea Google din contul agenției este finalizată, iar deploymentul web versiunea 2 a fost publicat pe 13 octombrie 2026 la 17:18 (ora București) cu `Execute as: Me` și acces `Anyone`. Verificările anonime confirmă că `GET` răspunde cu indicatorul generic al serviciului, iar un `POST` fără semnătură este respins cu `invalid`, fără scriere în foaie. Aceste verificări nu confirmă o livrare semnată sau sincronizarea rezervărilor. Cele nouă variabile necesare sunt salvate în Vercel pentru Production și Preview; deploymentul separat de testare este READY și a trecut compilarea, verificarea TypeScript și generarea statică. Pagina publică de test, [Programare — demo](https://programari-demo.santiersync.ro/programare), răspunde cu 200 fără redirect la autentificare. `BOOKING_ENABLED=true` și `CALCOM_WEBHOOK_ENABLED=true` sunt active numai în deploymentul separat. Webhookul Cal.com este salvat cu succes, activat și abonat la cinci declanșatoare (`created`, `rescheduled`, `cancelled`, `requested`, `rejected`); `subscriberURL` indică temporar endpointul public [API webhook — demo](https://programari-demo.santiersync.ro/api/calcom/webhook). Un `POST` nesemnat la acest API primește 401 `signature`, fără scriere în Sheets. Domeniul principal servește încă versiunea veche, iar `https://santiersync.ro/api/calcom/webhook` răspunde cu 404. După proba reușită a utilizatorului, versiunea se promovează pe domeniul principal, iar `subscriberURL` din Cal.com se schimbă la endpointul domeniului principal.

## Fluxul și condițiile de activare

1. Invitatul alege intervalul pe Cal.com și completează întrebările obligatorii în formularul Cal.com.
2. Cal.com trimite webhook-ul către `/api/calcom/webhook`. Serverul verifică semnătura Cal.com, ID-ul evenimentului și organizatorul înainte să proceseze evenimentul.
3. Serverul transmite evenimentul către Apps Script cu o a doua semnătură HMAC. Apps Script verifică semnătura și actualizează rândul rezervării în registrul privat.
4. Butonul public de programare se activează numai când evenimentul, întrebările, endpointul registrului și ambele legături semnate sunt configurate.

Site-ul este dezactivat implicit. În `.env.example`, `BOOKING_ENABLED=false` și `CALCOM_WEBHOOK_ENABLED=false`. Pentru activare sunt necesare toate variabilele de mai jos; setează valorile private în mediul Vercel potrivit, nu în Git:

| Variabilă | Valoare/scop |
|---|---|
| `BOOKING_ENABLED` | `true` doar în deploymentul separat de testare, pentru ca utilizatorul să poată verifica pagina; domeniul principal servește încă versiunea veche. |
| `CALCOM_EVENT_URL` | Evenimentul verificat: `https://cal.com/santiersyncro/30min`. Configurația acceptă doar HTTPS pe `cal.com` și calea organizatorului/evenimentului așteptat. |
| `CALCOM_EVENT_TYPE_ID` | ID-ul evenimentului păstrat în configurația privată; identifică sursa permisă a webhook-urilor. |
| `CALCOM_ORGANIZER_USERNAME` | `santiersyncro`. |
| `CALCOM_REQUIRED_QUESTIONS_CONFIRMED` | `true` numai cât timp ambele câmpuri obligatorii sunt salvate exact ca mai sus. |
| `CALCOM_WEBHOOK_ENABLED` | `true` în deploymentul separat de testare; configurarea separată permite verificarea manuală. |
| `CALCOM_WEBHOOK_SECRET` | Secret aleator, păstrat privat, comun doar între setarea webhook-ului Cal.com și Vercel. Minimum 32 de caractere. |
| `REGISTRY_ENDPOINT_URL` | URL-ul `/exec` al deploymentului Apps Script. Este un endpoint de primire, nu un link către foaia Google Sheets. |
| `REGISTRY_SHARED_SECRET` | Al doilea secret aleator; aceeași valoare în Vercel și în proprietatea Apps Script cu același nume. Minimum 32 de caractere. |

Scriptul local `scripts/prepare-booking.mjs` pregătește fișiere `.env.local` și `.env.booking.local`, ignorate de Git. Acesta generează chei noi dacă nu există deja valori valide și scrie ID-ul foii doar în fișierul local privat. Nu publica, nu copia în documentație și nu trimite conținutul acestor fișiere în chat. Adaugă secretele în Vercel prin interfața privată a proiectului. Nu hardcoda ID-ul foii, URL-ul ei sau cheile în sursă.

## Pașii rămași

1. Utilizatorul deschide [pagina publică de test](https://programari-demo.santiersync.ro/programare). URL-ul deploymentului intern și endpointul Apps Script `/exec` nu se publică în documentație ori Git.
2. Utilizatorul face proba controlată din secțiunea următoare. Abia după confirmarea sa că foaia s-a actualizat corect se promovează versiunea pe domeniul principal și se actualizează `subscriberURL` din Cal.com la `https://santiersync.ro/api/calcom/webhook`.

## Proba manuală a proprietarului

Folosește o singură rezervare fictivă controlată, fără datele unei persoane reale. Înainte de probă verifică faptul că în formular nu se poate continua cu niciuna dintre întrebările obligatorii lăsată goală. Apoi:

1. Creează rezervarea controlată și confirmă un singur rând nou în fila `Solicitări`, cu răspunsurile și starea așteptate.
2. Editează manual celulele corespunzătoare coloanelor M:Q din acel rând.
3. Reprogramează aceeași rezervare și verifică actualizarea rândului existent, păstrarea editărilor M:Q și asocierea UID-ului vechi cu cel nou.
4. Anulează rezervarea și confirmă actualizarea stării fără crearea unui al doilea rând și fără ștergerea editărilor manuale.
5. Notează data, deploymentul și rezultatul; nu salva răspunsuri, e-mailuri sau alte date personale în raportul de probă.

Fă proba în deploymentul separat, unde `BOOKING_ENABLED` și `CALCOM_WEBHOOK_ENABLED` sunt deja active. Creează o singură rezervare controlată, editează M:Q în rândul ei, reprogramează apoi anulează aceeași rezervare. Confirmă că toate evenimentele păstrează un singur rând și că editările manuale au rămas intacte. Verificările anonime ale handlerelor nu substituie această probă. După confirmarea manuală, promovează versiunea pe domeniul principal și actualizează `subscriberURL` la endpointul principal. Pentru a opri testul înainte de promovare, setează flagurile acelui deployment pe `false`; nu șterge foaia sau rezervările existente în timpul opririi.

## Resurse Google oficiale

- [Deploy a script as a web app](https://developers.google.com/apps-script/guides/web) — tipul deploymentului, URL-urile de test și identitatea de execuție.
- [Manage script properties](https://developers.google.com/apps-script/guides/properties) — adăugarea valorilor private în **Project Settings → Script Properties**.
- [Protect sheets and ranges](https://support.google.com/docs/answer/1218656?hl=en) — permisiuni și limite ale protecției în Google Sheets. Protecția intervalelor nu înlocuiește partajarea restrânsă a documentului.
