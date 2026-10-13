# Registrul privat de solicitări

Registrul urmărește exclusiv rezervările venite prin evenimentul Cal.com ȘantierSync. El nu primește mesajele trimise prin linkul `mailto:` de pe site. Linkul deschide aplicația de email a vizitatorului; site-ul nu primește și nu stochează acel mesaj. Dacă proprietarul dorește să urmărească și solicitările prin email, acestea se notează manual în registru sau se proiectează separat o integrare de contact.

## Starea actuală și confidențialitatea

Foaia Google Sheets a fost creată într-un cont Google personal al proprietarului și este privată. Contul agenției are acces de editor, aprobat explicit și verificat; proprietatea foii nu a fost transferată. ID-ul și linkul foii, e-mailul contului, ID-ul proiectului Apps Script și secretele nu se publică în acest ghid. Proiectul Apps Script există, iar codul din [`integrations/google-sheets/Code.gs`](../integrations/google-sheets/Code.gs) și proprietățile private sunt salvate. Autorizarea Google din contul agenției și publicarea web app-ului nu sunt finalizate; prin urmare, registrul nu primește încă rezervări.

Păstrează foaia partajată numai cu persoane pe care proprietarul le-a autorizat explicit. Ascunderea coloanelor ajută la organizare, dar nu este control de acces. Protecția intervalelor ajută la evitarea editărilor accidentale; proprietarul foii poate schimba inclusiv intervalele protejate, iar protecția nu împiedică un editor să copieze datele. Nu folosi un link public sau „Anyone with the link” pentru foaie.

## Structura foii

Fila se numește `Solicitări`. Scriptul creează antetul de 20 de coloane la primul `POST` valid, dacă fila este goală:

| Coloană | Antet | Gestionare |
|---|---|---|
| A | ID solicitare | Tehnic, ascuns și protejat |
| B | UID rezervare | Din Cal.com; tehnic, ascuns și protejat |
| C | Creată la | Tehnic, ascuns și protejat |
| D | Actualizare Cal.com | Tehnic, ascuns și protejat |
| E | Nume | Actualizat prin webhook |
| F | E-mail | Actualizat prin webhook |
| G | Firmă | Actualizat prin webhook, dacă a fost completată |
| H | Întâlnire (București) | Actualizat prin webhook, fus `Europe/Bucharest` |
| I | Întâlnire UTC | Tehnic, ascuns și protejat |
| J | Status programare | Din evenimentul Cal.com |
| K | Cum gestionați acum cererile? | Răspunsul obligatoriu din Cal.com |
| L | Unde pierdeți cel mai mult timp? | Răspunsul obligatoriu din Cal.com |
| M | Status solicitare | Editare manuală |
| N | Următorul pas | Editare manuală |
| O | Termen următorul pas | Editare manuală |
| P | Responsabil | Editare manuală |
| Q | Notițe | Editare manuală |
| R | Ultima sincronizare | Tehnic, ascuns și protejat |
| S | UID-uri asociate | Tehnic, ascuns și protejat |
| T | ID eveniment | Tehnic, ascuns și protejat |

Coloanele **M:Q** sunt spațiul de lucru manual. Webhook-ul actualizează datele rezervării și păstrează valorile deja introduse în M:Q la reprogramare sau anulare. Coloanele A:D, I și R:T sunt ascunse pentru lizibilitate și protejate pentru a evita editarea accidentală. Antetul este protejat. Nu șterge coloanele și nu schimba numele antetelor: scriptul verifică exact schema înainte de a scrie.

La prima primire validă, scriptul setează statusul solicitării `Nouă`, următorul pas `Pregătește discuția inițială` și responsabilul `ȘantierSync`. Acestea sunt date de lucru pe care proprietarul le poate modifica ulterior în M:Q.

## Sincronizare și editare manuală

- Evenimentele Cal.com pentru rezervări programate, reprogramate, anulate, în așteptare și respinse actualizează aceeași solicitare când UID-ul curent, UID-ul anterior sau aliasurile indică aceeași rezervare.
- O rezervare nouă adaugă un rând. O reprogramare actualizează rândul găsit și păstrează M:Q. Anulările vechi, evenimentele ajunse în ordine greșită și anulările fără pereche nu creează solicitări noi.
- Dacă un eveniment de reprogramare nu se poate lega de rândul existent și nu are răspunsurile obligatorii, scriptul îl respinge în loc să creeze un rând incomplet.
- Datele text care ar putea fi interpretate ca formule în Sheets sunt scrise ca text. Rândurile sunt actualizate sub un lock de script, iar payloadurile cu semnătură lipsă, incorectă sau expirată sunt respinse.
- Codul nu oferă o rută de citire a rezervărilor. `GET` răspunde doar cu un indicator simplu de serviciu; `POST` cere o semnătură HMAC validă. Nu folosi URL-ul `/exec` pentru a accesa foaia.

Nu adăuga formule sau conținut manual în coloanele gestionate de Cal.com. Nu copia rânduri duplicate pentru aceeași rezervare. Completează progresul și revenirea numai în M:Q. Nu include în notițe informații care nu sunt necesare pentru a urmări discuția.

## Finalizarea integrării Apps Script

Sunt necesare autorizarea umană a contului care publică scriptul și deploymentul web al codului Apps Script. Contul agenției are acces de editor la foaie și la scriptul asociat și va publica scriptul cu `Execute as: Me`. Autorizarea trebuie făcută în interfața Google din acel cont; nu trimite coduri OAuth, parole sau secrete prin chat.

1. În proiectul Apps Script deschide **Project Settings → Script Properties** și adaugă două proprietăți. Valorile se obțin numai din configurația locală privată pregătită pentru integrare:

   | Nume proprietate | Valoare |
   |---|---|
   | `REGISTRY_SPREADSHEET_ID` | ID-ul foii private a proprietarului |
   | `REGISTRY_SHARED_SECRET` | Secretul aleator care corespunde lui `REGISTRY_SHARED_SECRET` din mediul Vercel |

   Nu pune URL-ul sau ID-ul foii în sursa Apps Script, în acest document sau în setările publice ale site-ului. Proprietățile Apps Script sunt valori server-side asociate proiectului; nu sunt partajate automat cu alte proiecte.
2. Rulează fluxul de autorizare Google din contul agenției și acordă accesul cerut pentru a scrie în foaia la care acel cont este editor. Confirmă manual contul afișat și faptul că fila și foaia așteptate sunt private.
3. Alege **Deploy → New deployment → Web app**, **Execute as: Me** și acces **Anyone** (inclusiv anonim), apoi copiază URL-ul `/exec` în `REGISTRY_ENDPOINT_URL` din mediul privat Vercel. Accesul public este necesar pentru cererea server-la-server, dar nu expune rândurile: GET nu citește registrul, iar POST acceptă doar date cu HMAC corect. Nu distribui URL-ul ca pe un link de vizualizare a foii.
4. Apps Script-ul verifică a doua semnătură HMAC cu `REGISTRY_SHARED_SECRET`, o limită de vârstă de cinci minute și schema evenimentului înainte de a schimba rânduri. Site-ul verifică prima semnătură Cal.com și sursa evenimentului înainte să trimită mai departe. Păstrează cele două secrete distincte.
5. În Vercel configurează `REGISTRY_ENDPOINT_URL`, `REGISTRY_SHARED_SECRET`, `CALCOM_WEBHOOK_SECRET`, `CALCOM_EVENT_TYPE_ID`, `CALCOM_ORGANIZER_USERNAME`, `CALCOM_WEBHOOK_ENABLED` și `BOOKING_ENABLED`. Lasă `BOOKING_ENABLED=false` până la proba manuală completă din [ghidul Cal.com](./PROGRAMARI-CALCOM.md).

Nu activa un deployment Apps Script vechi doar pentru că există. După modificarea codului, publică o versiune nouă și confirmă că deploymentul activ folosește versiunea salvată curentă. URL-ul test `/dev` este destinat editorilor proiectului și nu se folosește în Vercel.

## Verificare și oprire

Proba inițială se face cu o singură rezervare fictivă controlată, apoi se reprogramează și se anulează. Proprietarul confirmă că a apărut un singur rând, că starea a fost actualizată și că editările M:Q au rămas neschimbate. Verificarea manuală nu se înlocuiește cu un test automat, un HTTP 200, o pagină iframe încărcată sau un `GET` sănătos al endpointului.

La oprirea programărilor, setează `BOOKING_ENABLED=false`; pentru a opri și webhook-ul, setează `CALCOM_WEBHOOK_ENABLED=false`. Păstrează foaia privată și datele deja primite conform perioadei de păstrare pe care o aprobă proprietarul. Revizuiește periodic cine are acces și retrage accesul celor care nu mai au nevoie de el.

Resurse: [Script Properties](https://developers.google.com/apps-script/guides/properties), [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [protecția foilor și intervalelor Google Sheets](https://support.google.com/docs/answer/1218656?hl=en). Google precizează că protecțiile de interval nu trebuie folosite ca măsură de securitate; restricționează partajarea foii în sine.
