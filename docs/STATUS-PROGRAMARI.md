# Status programări — 13 octombrie 2026

- Lucrul la programări este pe branch-ul `feat/cal-booking`, separat de `main` și de modificările analytics aflate în lucru.
- Evenimentul gratuit Cal.com de 30 de minute și cele două întrebări obligatorii sunt configurate și confirmate. Întrebarea „Firmă” rămâne opțională. Linkul public este descris în [ghidul Cal.com](PROGRAMARI-CALCOM.md); ID-ul evenimentului rămâne în configurația privată.
- Registrul Google Sheets este deținut de proprietarul contului personal. Contul agenției are acces de editor, acordat și verificat; foaia rămâne privată.
- Autorizarea Google din contul agenției este finalizată. Deploymentul Apps Script versiunea 2 a fost publicat pe 13 octombrie 2026 la 17:18 (ora București), cu `Execute as: Me` din contul agenției și acces `Anyone`. Adresa `/exec` este păstrată privat.
- Verificările anonime confirmă că `GET` răspunde cu indicatorul generic al serviciului, iar `POST` fără semnătură răspunde cu `invalid` fără să scrie în foaie. Aceste probe confirmă că handler-ele sunt disponibile; nu confirmă o trimitere autentificată sau sincronizarea unei rezervări.
- Cele nouă variabile sunt salvate în Vercel pentru Production și Preview. Deploymentul separat de testare este READY; compilarea, verificarea TypeScript și generarea statică au reușit. Are `BOOKING_ENABLED=true` și `CALCOM_WEBHOOK_ENABLED=true`. [Pagina publică de test](https://programari-demo.santiersync.ro/programare) răspunde cu 200, fără redirect la autentificare. `POST` nesemnat către [API-ul webhook de test](https://programari-demo.santiersync.ro/api/calcom/webhook) este respins cu 401 `signature`, înainte de orice scriere în Sheets.
- Webhookul Cal.com a fost salvat cu succes, este activ și abonat la cinci evenimente: `created`, `rescheduled`, `cancelled`, `requested` și `rejected`. `subscriberURL` indică temporar API-ul deploymentului de test. Domeniul principal păstrează încă versiunea veche; `/api/calcom/webhook` pe acesta răspunde cu 404.
- Testul manual complet îi revine utilizatorului: o rezervare, editarea M:Q, reprogramarea, anularea și verificarea unui singur rând cu valorile manuale păstrate. După confirmarea reușită, deploymentul se promovează pe domeniul principal, iar `subscriberURL` se schimbă la `https://santiersync.ro/api/calcom/webhook`.

## Verificări și limite

Verificările locale lint, TypeScript și build au trecut înainte de publicare. Buildul Vercel al versiunii de test a trecut de asemenea; testarea vizuală și a rezervărilor îi revine utilizatorului.

Au trecut și opt probe automate simulate pentru semnături, sursă, întrebări obligatorii, răspunsuri multiline, duplicate, reprogramare, anulări vechi, formule și păstrarea coloanelor manuale. Cererea publică nesemnată a endpointului de test primește 401 `signature`, confirmând că handlerul respinge cereri fără semnătură. Nu s-a făcut încă o rezervare semnată și nu s-a confirmat sincronizarea registrului; testul manual al utilizatorului rămâne necesar.

## Pașii rămași

1. Utilizatorul deschide [pagina publică de test](https://programari-demo.santiersync.ro/programare) și urmează pașii manuali din [ghidul Cal.com](PROGRAMARI-CALCOM.md): rezervă, editează M:Q, reprogramează, apoi anulează.
2. După confirmarea unui singur rând corect, inclusiv păstrarea editărilor M:Q, deploymentul se promovează pe domeniul principal și `subscriberURL` din Cal.com se schimbă la `https://santiersync.ro/api/calcom/webhook`.

Detalii: [programări](PROGRAMARI-CALCOM.md) și [registru](REGISTRU-SOLICITARI.md).
