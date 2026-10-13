# Programări prin Cal.com

Ghidul descrie configurarea evenimentului și activarea legăturii Cal.com → site → registrul privat. Este destinat proprietarului proiectului. Nu copia chei, URL-uri private, date de autentificare sau date ale invitaților în documente publice, conversații ori Git.

## Starea configurării

La 13 octombrie 2026, profilul Cal.com `santiersyncro` are evenimentul gratuit de 30 de minute `https://cal.com/santiersyncro/30min`, cu ID `7459353` și titlul „Discuție inițială — ȘantierSync”. Descrierea evenimentului este salvată. Întrebările native au fost salvate și verificate prin API-ul public al evenimentului:

| Câmp | Setare confirmată |
|---|---|
| `gestionare_cereri` | Obligatoriu; „Cum gestionați acum cererile?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| `blocaj_timp` | Obligatoriu; „Unde pierdeți cel mai mult timp?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| Firmă | Opțional |

Evenimentul păstrează setarea Cal Video și disponibilitatea existentă. Nu s-a făcut o verificare de conflict între calendare și nu se afirmă că fiecare interval este liber sau verificat. Nu schimba programul disponibilității fără decizia proprietarului. Confirmările native Cal.com rămân singurele notificări automate cerute; nu sunt configurate notificări SMS, un CRM sau o campanie de email.

Registrul privat a fost creat și codul Apps Script a fost încărcat/salvat. Proprietățile private, autorizarea Google și deploymentul web nu sunt încă gata. Până la finalizarea și verificarea acestor pași, programarea rămâne dezactivată pe site.

## Fluxul și condițiile de activare

1. Invitatul alege intervalul pe Cal.com și completează întrebările obligatorii în formularul Cal.com.
2. Cal.com trimite webhook-ul către `/api/calcom/webhook`. Serverul verifică semnătura Cal.com, ID-ul evenimentului și organizatorul înainte să proceseze evenimentul.
3. Serverul transmite evenimentul către Apps Script cu o a doua semnătură HMAC. Apps Script verifică semnătura și actualizează rândul rezervării în registrul privat.
4. Butonul public de programare se activează numai când evenimentul, întrebările, endpointul registrului și ambele legături semnate sunt configurate.

Site-ul este dezactivat implicit. În `.env.example`, `BOOKING_ENABLED=false` și `CALCOM_WEBHOOK_ENABLED=false`. Pentru activare sunt necesare toate variabilele de mai jos; setează valorile private în mediul Vercel potrivit, nu în Git:

| Variabilă | Valoare/scop |
|---|---|
| `BOOKING_ENABLED` | Rămâne `false` până când webhook-ul și registrul au fost configurate și proba manuală a reușit; se setează `true` ultimul. |
| `CALCOM_EVENT_URL` | Evenimentul verificat: `https://cal.com/santiersyncro/30min`. Configurația acceptă doar HTTPS pe `cal.com` și calea organizatorului/evenimentului așteptat. |
| `CALCOM_EVENT_TYPE_ID` | `7459353`; identifică sursa permisă a webhook-urilor. |
| `CALCOM_ORGANIZER_USERNAME` | `santiersyncro`. |
| `CALCOM_REQUIRED_QUESTIONS_CONFIRMED` | `true` numai cât timp ambele câmpuri obligatorii sunt salvate exact ca mai sus. |
| `CALCOM_WEBHOOK_ENABLED` | `false` până când endpointul Apps Script răspunde și configurația Vercel este completă; se activează pentru proba tehnică. |
| `CALCOM_WEBHOOK_SECRET` | Secret aleator, păstrat privat, comun doar între setarea webhook-ului Cal.com și Vercel. Minimum 32 de caractere. |
| `REGISTRY_ENDPOINT_URL` | URL-ul `/exec` al deploymentului Apps Script. Este un endpoint de primire, nu un link către foaia Google Sheets. |
| `REGISTRY_SHARED_SECRET` | Al doilea secret aleator; aceeași valoare în Vercel și în proprietatea Apps Script cu același nume. Minimum 32 de caractere. |

Scriptul local `scripts/prepare-booking.mjs` pregătește fișiere `.env.local` și `.env.booking.local`, ignorate de Git. Acesta generează chei noi dacă nu există deja valori valide și scrie ID-ul foii doar în fișierul local privat. Nu publica, nu copia în documentație și nu trimite conținutul acestor fișiere în chat. Adaugă secretele în Vercel prin interfața privată a proiectului. Nu hardcoda ID-ul foii, URL-ul ei sau cheile în sursă.

## Pașii rămași pentru proprietar

1. **Revizuiește evenimentul Cal.com.** Confirmă URL-ul, ID-ul, titlul și cele două întrebări obligatorii. Lasă întrebarea „Firmă” opțională și păstrează disponibilitatea curentă. Nu modifica durata sau descrierea fără să fie necesar.
2. **Finalizează registrul.** Urmează [Ghidul registrului de solicitări](./REGISTRU-SOLICITARI.md). Autorizează Apps Script cu contul Google proprietar al foii și configurează cele două Script Properties cerute acolo.
3. **Publică Apps Script ca web app.** În proiectul Apps Script: **Deploy → New deployment → Web app**. Alege **Execute as: Me** și acces pentru **Anyone** (inclusiv utilizator neautentificat), astfel încât webhook-ul server-la-server să poată ajunge la endpoint. Endpointul public nu oferă citire de rânduri, iar `POST` acceptă numai plicuri cu semnătură validă. Dacă această setare nu este disponibilă în cont, oprește-te și cere o decizie; nu publica foaia și nu reduce verificarea semnăturii.
4. **Configurează mediul Vercel.** Adaugă variabilele de mai sus pentru mediul ales. Folosește secretele pregătite local fără să le afișezi. Setează `REGISTRY_ENDPOINT_URL` la URL-ul deploymentului care se termină în `/exec`.
5. **Configurează webhook-ul Cal.com.** Folosește URL-ul aplicației `https://santiersync.ro/api/calcom/webhook`, secretul `CALCOM_WEBHOOK_SECRET` și evenimentele de rezervare create, reprogramate, anulate, solicitate și respinse. Confirmă că abonamentul folosește evenimentul și organizatorul potrivite. Nu considera simpla salvare a formularului o livrare reușită.
6. **Verifică mai întâi webhook-ul cu butonul site-ului oprit.** Activează temporar `CALCOM_WEBHOOK_ENABLED=true` doar după ce endpointul Apps Script și secretele sunt gata; lasă `BOOKING_ENABLED=false`. Urmează proba manuală din secțiunea următoare.
7. **Activează programările publice numai după reușita probei.** Configurează și publică deploymentul Vercel necesar, apoi setează `BOOKING_ENABLED=true`. Verifică pagina `/programare` și linkul extern Cal.com în mediul potrivit. Nu folosi iframe-ul drept dovadă că rezervarea ori sincronizarea registrului funcționează.

## Proba manuală a proprietarului

Folosește o singură rezervare fictivă controlată, fără datele unei persoane reale. Înainte de probă verifică faptul că în formular nu se poate continua cu niciuna dintre întrebările obligatorii lăsată goală. Apoi:

1. Creează rezervarea controlată și confirmă un singur rând nou în fila `Solicitări`, cu răspunsurile și starea așteptate.
2. Editează manual celulele corespunzătoare coloanelor M:Q din acel rând.
3. Reprogramează aceeași rezervare și verifică actualizarea rândului existent, păstrarea editărilor M:Q și asocierea UID-ului vechi cu cel nou.
4. Anulează rezervarea și confirmă actualizarea stării fără crearea unui al doilea rând și fără ștergerea editărilor manuale.
5. Notează data, deploymentul și rezultatul; nu salva răspunsuri, e-mailuri sau alte date personale în raportul de probă.

Numai după aceste verificări setează `BOOKING_ENABLED=true`. Oprește programările setând `BOOKING_ENABLED=false`; pentru a opri și primirea evenimentelor, setează și `CALCOM_WEBHOOK_ENABLED=false`. Nu șterge foaia sau rezervările existente în timpul opririi.

## Resurse Google oficiale

- [Deploy a script as a web app](https://developers.google.com/apps-script/guides/web) — tipul deploymentului, URL-urile de test și identitatea de execuție.
- [Manage script properties](https://developers.google.com/apps-script/guides/properties) — adăugarea valorilor private în **Project Settings → Script Properties**.
- [Protect sheets and ranges](https://support.google.com/docs/answer/1218656?hl=en) — permisiuni și limite ale protecției în Google Sheets. Protecția intervalelor nu înlocuiește partajarea restrânsă a documentului.
