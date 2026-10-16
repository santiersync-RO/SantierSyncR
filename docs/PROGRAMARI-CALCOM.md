# Programări prin Cal.com

Ghidul descrie configurarea evenimentului și activarea legăturii Cal.com → site → registrul privat. Este destinat proprietarului proiectului. Nu copia chei, URL-uri private, date de autentificare sau date ale invitaților în documente publice, conversații ori Git.

## Starea configurării

La 13 octombrie 2026, profilul Cal.com `santiersyncro` are evenimentul gratuit de 30 de minute `https://cal.com/santiersyncro/30min`, cu titlul „Discuție inițială — ȘantierSync”. ID-ul evenimentului rămâne în configurația privată. Descrierea evenimentului este salvată. Întrebările native au fost salvate și verificate prin API-ul public al evenimentului:

| Câmp | Setare confirmată |
|---|---|
| `gestionare_cereri` | Obligatoriu; „Cum gestionați acum cererile?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| `blocaj_timp` | Obligatoriu; „Unde pierdeți cel mai mult timp?”; răspuns text, minimum 1 și maximum 1000 de caractere |
| Firmă | Opțional |

Disponibilitatea este gestionată de utilizator în Cal.com; agentul nu a modificat setările de disponibilitate. Confirmările native Cal.com rămân singurele notificări automate cerute; nu sunt configurate notificări SMS, un CRM sau o campanie de email.

Răspunsurile Google Calendar la o invitație (`Accept`, `Decline` sau `Maybe`) sunt RSVP-uri pentru evenimentul din Google Calendar; singure nu anulează și nu modifică rezervarea Cal.com. Pentru anulare sau reprogramare folosește acțiunea Cal.com din pagina Bookings ori linkul din mesajul de confirmare. Ștergerea evenimentului doar din calendarul conectat nu elimină rezervarea din Cal.com. Google Calendar permite consultarea RSVP-urilor în lista invitaților și configurarea notificărilor pentru răspunsuri. Surse: [FAQ Cal.com — anulări și răspunsuri Google Calendar](https://cal.com/faq) și [Google Calendar — urmărirea răspunsurilor invitaților](https://support.google.com/calendar/answer/16713792).

Registrul privat este creat, iar codul Apps Script și proprietățile private sunt salvate. Foaia este deținută de proprietarul contului personal; contul agenției are acces de editor. Deploymentul Apps Script versiunea 2 rulează cu `Execute as: Me` din contul agenției și acces `Anyone`. Cele nouă variabile necesare sunt salvate în Vercel pentru Production și Preview. Utilizatorul a confirmat pe 13 octombrie 2026 testul manual complet pe deploymentul demo: rezervare, editare M:Q, reprogramare și anulare; registrul a păstrat un singur rând și valorile manuale. Același deployment a fost promovat pe domeniul principal, iar demo-ul rămâne disponibil la [Programare — demo](https://programari-demo.santiersync.ro/programare). Pagina principală [Programare](https://santiersync.ro/programare) răspunde cu 200 fără redirect la autentificare. `POST` nesemnat la [API-ul webhook principal](https://santiersync.ro/api/calcom/webhook) răspunde 401 `signature`, fără scriere în Sheets; aceasta este verificarea HTTP de după promovare, nu o repetare a testului manual. Webhookul Cal.com este salvat și activ, cu aceleași cinci declanșatoare (`created`, `rescheduled`, `cancelled`, `requested`, `rejected`) și același secret; `subscriberURL` indică acum API-ul principal.

## Fluxul și condițiile de activare

1. Invitatul alege intervalul pe Cal.com și completează întrebările obligatorii în formularul Cal.com.
2. Cal.com trimite webhook-ul către `/api/calcom/webhook`. Serverul verifică semnătura Cal.com, ID-ul evenimentului și organizatorul înainte să proceseze evenimentul.
3. Serverul transmite evenimentul către Apps Script cu o a doua semnătură HMAC. Apps Script verifică semnătura și actualizează rândul rezervării în registrul privat.
4. Butonul public de programare se activează numai când evenimentul, întrebările, endpointul registrului și ambele legături semnate sunt configurate.

Site-ul este dezactivat implicit. În `.env.example`, `BOOKING_ENABLED=false` și `CALCOM_WEBHOOK_ENABLED=false`. Pentru activare sunt necesare toate variabilele de mai jos; setează valorile private în mediul Vercel potrivit, nu în Git:

| Variabilă | Valoare/scop |
|---|---|
| `BOOKING_ENABLED` | Activ pe domeniul principal și pe demo după promovarea buildului testat. |
| `CALCOM_EVENT_URL` | Evenimentul verificat: `https://cal.com/santiersyncro/30min`. Configurația acceptă doar HTTPS pe `cal.com` și calea organizatorului/evenimentului așteptat. |
| `CALCOM_EVENT_TYPE_ID` | ID-ul evenimentului păstrat în configurația privată; identifică sursa permisă a webhook-urilor. |
| `CALCOM_ORGANIZER_USERNAME` | `santiersyncro`. |
| `CALCOM_REQUIRED_QUESTIONS_CONFIRMED` | `true` numai cât timp ambele câmpuri obligatorii sunt salvate exact ca mai sus. |
| `CALCOM_WEBHOOK_ENABLED` | Activ pe deploymentul publicat; webhookul Cal.com indică ruta API de pe domeniul principal. |
| `CALCOM_WEBHOOK_SECRET` | Secret aleator, păstrat privat, comun doar între setarea webhook-ului Cal.com și Vercel. Minimum 32 de caractere. |
| `REGISTRY_ENDPOINT_URL` | URL-ul `/exec` al deploymentului Apps Script. Este un endpoint de primire, nu un link către foaia Google Sheets. |
| `REGISTRY_SHARED_SECRET` | Al doilea secret aleator; aceeași valoare în Vercel și în proprietatea Apps Script cu același nume. Minimum 32 de caractere. |

Scriptul local `scripts/prepare-booking.mjs` pregătește fișiere `.env.local` și `.env.booking.local`, ignorate de Git. Acesta generează chei noi dacă nu există deja valori valide și scrie ID-ul foii doar în fișierul local privat. Nu publica, nu copia în documentație și nu trimite conținutul acestor fișiere în chat. Adaugă secretele în Vercel prin interfața privată a proiectului. Nu hardcoda ID-ul foii, URL-ul ei sau cheile în sursă.

## Proba manuală confirmată

Utilizatorul a făcut această verificare pe deploymentul demo pe 13 octombrie 2026. El a rezervat în Cal.com, a editat M:Q, a reprogramat și a anulat aceeași rezervare. Rezultatul confirmat a fost un singur rând, cu editările M:Q păstrate. Același deployment a fost promovat ulterior pe domeniul principal; testul manual nu a fost repetat acolo.

Pașii de verificare, pentru referință:

1. Creează rezervarea controlată și confirmă un singur rând nou în fila `Solicitări`, cu răspunsurile și starea așteptate.
2. Editează manual celulele corespunzătoare coloanelor M:Q din acel rând.
3. Reprogramează aceeași rezervare și verifică actualizarea rândului existent, păstrarea editărilor M:Q și asocierea UID-ului vechi cu cel nou.
4. Anulează rezervarea și confirmă actualizarea stării fără crearea unui al doilea rând și fără ștergerea editărilor manuale.
5. Notează data, deploymentul și rezultatul; nu salva răspunsuri, e-mailuri sau alte date personale în raportul de probă.

Verificarea manuală îi revine utilizatorului; nu a fost repetată automat după promovare. Pagina și API-ul principal au fost verificate separat prin HTTP: pagina a răspuns 200, iar API-ul a respins `POST` nesemnat cu 401 `signature`.

## Rollback și oprire

Înainte de rollback la o versiune fără ruta API, dezactivează webhookul Cal.com ca să eviți retry-uri către 404. Apoi promovează deploymentul anterior. Dacă oprești programările, setează `BOOKING_ENABLED=false` și `CALCOM_WEBHOOK_ENABLED=false` pentru deploymenturile viitoare și publică un deployment nou. Nu șterge foaia sau rezervările existente.

## Resurse Google oficiale

- [Deploy a script as a web app](https://developers.google.com/apps-script/guides/web) — tipul deploymentului, URL-urile de test și identitatea de execuție.
- [Manage script properties](https://developers.google.com/apps-script/guides/properties) — adăugarea valorilor private în **Project Settings → Script Properties**.
- [Protect sheets and ranges](https://support.google.com/docs/answer/1218656?hl=en) — permisiuni și limite ale protecției în Google Sheets. Protecția intervalelor nu înlocuiește partajarea restrânsă a documentului.
