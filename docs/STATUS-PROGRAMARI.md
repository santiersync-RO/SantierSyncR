# Status programări — 13 octombrie 2026

- Branch de lucru: `feat/cal-booking`, separat de `main` și de modificările analytics aflate în lucru.
- Reper de cod: `v0.5-programari-pregatite`. Codul și documentația sunt sincronizate pe GitHub; fișierele `.env` sunt ignorate.
- Eveniment Cal.com Free: `https://cal.com/santiersyncro/30min`, 30 minute, „Discuție inițială — ȘantierSync”.
- Cele două întrebări sunt salvate ca obligatorii în Cal.com și confirmate prin API-ul public al evenimentului. Câmpul „Firmă” este opțional.
- Registrul Google Sheets privat este creat, cu câmpuri pentru răspunsuri, întâlnire, status, următorul pas, termen, responsabil și notițe. Legătura privată și identificatorul sunt păstrate în configurația locală, nu în Git.
- Contul agenției are acces de editor, acordat cu aprobarea explicită a proprietarului și verificat. Proprietatea foii rămâne în contul personal; foaia nu are acces public.
- Codul Apps Script și proprietățile private sunt salvate în proiectul asociat foii. Webhookul Cal.com este salvat și inactiv.
- Publicarea pregătită din contul personal a fost închisă. Urmează autentificarea și autorizarea Google din contul agenției, apoi publicarea cu `Execute as: Me` din acel cont. Endpointul `/exec` și sincronizarea reală către registru nu sunt încă confirmate.
- Configurația evenimentului și cele două secrete au fost salvate în Vercel pentru Production și Preview, fără afișarea valorilor. `REGISTRY_ENDPOINT_URL` și activarea sunt în așteptare.
- Site-ul public nu a fost înlocuit cu această versiune. Pagina `/programare` și linkurile de rezervare sunt pregătite în cod, dar rămân dezactivate până la conectarea efectivă a registrului.

## Verificări tehnice

Lint, TypeScript și build au trecut. Au trecut opt probe automate pentru semnături, sursă, întrebări obligatorii, răspunsuri multiline, duplicate, reprogramare, anulări vechi, formule introduse ca text și păstrarea coloanelor manuale. Probele Apps Script rulează într-un mediu simulat; nu confirmă autorizarea Google sau sincronizarea unui eveniment real.

Testarea manuală a site-ului și a unei rezervări complete rămâne la proprietar. Nu s-au creat rezervări reale sau mesaje către potențiali clienți pentru testare.

## Continuare

1. Utilizatorul se autentifică în contul agenției și finalizează autorizarea Google pentru aplicația de sincronizare, după pregătirea publicării din acel cont.
2. Se confirmă deploymentul Apps Script și se salvează adresa `/exec` în mediul Vercel.
3. Se publică versiunea pentru verificarea manuală, se activează legătura semnată și se verifică o programare controlată în registru.
4. Se finalizează publicarea pe domeniu, păstrând modificările CMS și analytics existente.

Detalii: [programări](PROGRAMARI-CALCOM.md) și [registru](REGISTRU-SOLICITARI.md).
