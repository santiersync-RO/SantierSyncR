# Status programări — 13 octombrie 2026

- Reperul versiunii publicate este `v0.5.2-programari-publicate`. Codul este păstrat în branch-ul `feat/cal-booking` și integrat în `main` pe GitHub. Copia locală actuală este worktree-ul programărilor; checkout-ul principal cu modificări analytics nefinalizate rămâne neatins.
- Evenimentul gratuit Cal.com de 30 de minute și întrebările obligatorii sunt configurate. Registrul Google Sheets rămâne în proprietatea contului personal; contul agenției are acces de editor.
- Deploymentul Apps Script versiunea 2 rulează din contul agenției cu `Execute as: Me` și acces `Anyone`. Adresa `/exec` este păstrată în configurația privată. Endpointul este accesibil public, dar acceptă scrieri numai cu semnătura validă; foaia rămâne privată.
- Utilizatorul a confirmat testul manual complet pe deploymentul demo: rezervare Cal.com, editarea coloanelor M:Q, reprogramare și anulare. Registrul a păstrat un singur rând și editările manuale.
- Deploymentul testat a fost promovat pe `https://santiersync.ro/programare`. Pagina răspunde cu 200 fără redirect la autentificare. `POST` nesemnat la `https://santiersync.ro/api/calcom/webhook` răspunde 401 `{code: signature}` și nu scrie în Sheets. Proba manuală a sincronizării a fost făcută pe demo, pe același deployment care a fost promovat; verificările HTTP de pe domeniul principal confirmă doar răspunsul paginii și protecția semnăturii.
- Webhookul Cal.com este salvat cu succes și activ. Aceleași cinci evenimente (`created`, `rescheduled`, `cancelled`, `requested`, `rejected`) și același secret au rămas configurate; `subscriberURL` indică acum `https://santiersync.ro/api/calcom/webhook`.
- Cele nouă variabile sunt salvate în Vercel pentru Production și Preview. Versiunea demo rămâne disponibilă la [programari-demo.santiersync.ro/programare](https://programari-demo.santiersync.ro/programare).
- Disponibilitatea este gestionată de utilizator în Cal.com; agentul nu a modificat setările de disponibilitate.

## Verificări

Deploymentul promovat este READY; compilarea, verificarea TypeScript și generarea statică au reușit. Lint, TypeScript și buildul au trecut și în verificările locale anterioare. Au trecut opt probe automate simulate pentru semnături, sursă, întrebări obligatorii, răspunsuri multiline, duplicate, reprogramare, anulări vechi, formule și păstrarea coloanelor manuale. Testul manual al utilizatorului a verificat sincronizarea pe demo; nu s-a repetat rezervarea după promovare.

## Operare și rollback

Pentru rollback la o versiune care nu are API-ul webhook, dezactivează mai întâi webhookul Cal.com pentru a evita retry-urile către un răspuns 404, apoi promovează deploymentul anterior. Dacă funcționalitatea de programare se oprește, păstrează `BOOKING_ENABLED=false` și `CALCOM_WEBHOOK_ENABLED=false` în setările viitoare și publică un deployment nou.

Detalii: [programări](PROGRAMARI-CALCOM.md) și [registru](REGISTRU-SOLICITARI.md).
