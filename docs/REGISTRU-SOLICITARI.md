# Registrul privat de solicitări

Registrul urmărește exclusiv rezervările venite prin evenimentul Cal.com ȘantierSync. El nu primește mesajele trimise prin linkul `mailto:` de pe site. Linkul deschide aplicația de email a vizitatorului; site-ul nu primește și nu stochează acel mesaj. Dacă proprietarul dorește să urmărească și solicitările prin email, acestea se notează manual în registru sau se proiectează separat o integrare de contact.

## Starea actuală și confidențialitatea

Foaia Google Sheets este deținută de proprietarul contului personal și rămâne privată. Contul agenției are acces de editor, aprobat explicit și verificat; proprietatea foii nu a fost transferată. ID-ul și linkul foii, e-mailurile, ID-ul proiectului Apps Script, URL-ul privat `/exec` și secretele nu se publică în acest ghid. Proiectul Apps Script și proprietățile private sunt salvate. Deploymentul Apps Script versiunea 2 este publicat din contul agenției cu `Execute as: Me` și acces `Anyone`. Cele nouă variabile sunt salvate în Vercel pentru Production și Preview. Deploymentul separat de test este READY: [pagina de programare](https://programari-demo.santiersync.ro/programare) răspunde cu 200, iar `POST` nesemnat la [API-ul webhook de test](https://programari-demo.santiersync.ro/api/calcom/webhook) primește 401 `signature`, fără scriere în Sheets. Aceste probe nu confirmă o livrare semnată sau sincronizarea rezervărilor. Webhookul Cal.com este salvat, activ și abonat la cele cinci evenimente; `subscriberURL` indică temporar API-ul de test. Domeniul principal păstrează versiunea veche, iar API-ul său răspunde momentan 404.

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
- Codul nu oferă o rută de citire a rezervărilor. Verificările curente arată că `GET` oferă numai un indicator de serviciu și că un `POST` nesemnat este respins fără scriere. Nu s-a verificat un `POST` semnat și nu considera registrul conectat până la proba manuală a utilizatorului.

Nu adăuga formule sau conținut manual în coloanele gestionate de Cal.com. Nu copia rânduri duplicate pentru aceeași rezervare. Completează progresul și revenirea numai în M:Q. Nu include în notițe informații care nu sunt necesare pentru a urmări discuția.

## Starea deploymentului și configurarea privată

Autorizarea Google este finalizată, iar deploymentul web versiunea 2 este publicat din contul agenției cu `Execute as: Me` și acces `Anyone`, necesar pentru cererile server-la-server. Verificările anonime Apps Script au confirmat funcțiile `GET` și `POST`; deploymentul Vercel separat este READY și răspunde la [pagina de test](https://programari-demo.santiersync.ro/programare). Un `POST` nesemnat la API-ul de test este respins cu 401 `signature`; acest răspuns nu confirmă o actualizare semnată a foii. URL-ul privat `/exec` nu se include în documentație și nu se distribuie pentru acces la foaie.

Proprietățile Apps Script sunt deja salvate în proiectul asociat foii. Cele nouă variabile necesare sunt salvate în Vercel pentru Production și Preview. Un deployment separat de testare are `BOOKING_ENABLED=true` și `CALCOM_WEBHOOK_ENABLED=true`, iar subscriberul Cal.com îl folosește temporar. Domeniul principal servește încă versiunea veche, iar API-ul său răspunde cu 404. Pentru referință, numele proprietăților Apps Script și scopurile lor sunt:

   | Nume proprietate | Valoare |
   |---|---|
   | `REGISTRY_SPREADSHEET_ID` | ID-ul foii private a proprietarului |
   | `REGISTRY_SHARED_SECRET` | Secretul aleator care corespunde lui `REGISTRY_SHARED_SECRET` din mediul Vercel |

Nu pune URL-ul sau ID-ul foii în sursa Apps Script, în acest document sau în setările publice ale site-ului. Proprietățile Apps Script sunt valori server-side asociate proiectului; nu sunt partajate automat cu alte proiecte.

1. Utilizatorul deschide [pagina publică de test](https://programari-demo.santiersync.ro/programare), creează o singură rezervare, editează coloanele M:Q, apoi reprogramează și anulează aceeași rezervare.
2. Utilizatorul confirmă că registrul conține un singur rând, că actualizările rezervării au ajuns și că editările M:Q s-au păstrat. Până la această confirmare, sincronizarea nu este considerată verificată.
3. După confirmarea reușită se promovează deploymentul pe domeniul principal și `subscriberURL` din Cal.com se schimbă la `https://santiersync.ro/api/calcom/webhook`. Până atunci, domeniul principal rămâne pe versiunea veche.

Apps Script-ul verifică a doua semnătură HMAC cu `REGISTRY_SHARED_SECRET`, o limită de vârstă de cinci minute și schema evenimentului înainte de a schimba rânduri. Site-ul verifică prima semnătură Cal.com și sursa evenimentului înainte să trimită mai departe. Păstrează cele două secrete distincte. Accesul `Anyone` se aplică endpointului de primire, nu foii Google Sheets; foaia rămâne partajată numai cu persoanele autorizate.

## Verificare și oprire

Deploymentul separat de test este READY, cu pagina publică și webhookul activate. Utilizatorul face proba cu o singură rezervare, editează M:Q, apoi reprogramează și anulează aceeași rezervare. Confirmă că rândul a fost actualizat și că editările manuale au rămas intacte. Verificarea manuală nu se înlocuiește cu un test automat, un HTTP 200, o pagină iframe încărcată sau un răspuns `GET` al endpointului.

La oprirea programărilor, setează `BOOKING_ENABLED=false`; pentru a opri și webhook-ul, setează `CALCOM_WEBHOOK_ENABLED=false`. Păstrează foaia privată și datele deja primite conform perioadei de păstrare pe care o aprobă proprietarul. Revizuiește periodic cine are acces și retrage accesul celor care nu mai au nevoie de el.

Resurse: [Script Properties](https://developers.google.com/apps-script/guides/properties), [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [protecția foilor și intervalelor Google Sheets](https://support.google.com/docs/answer/1218656?hl=en). Google precizează că protecțiile de interval nu trebuie folosite ca măsură de securitate; restricționează partajarea foii în sine.
