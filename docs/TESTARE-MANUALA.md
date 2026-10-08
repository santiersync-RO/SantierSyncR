# Testare manuală înainte de publicare

## Prima rundă — versiunea locală

Deschide [versiunea locală](http://127.0.0.1:3000) și fă doar această verificare inițială, fără code review. Homepage-ul urmează macheta cu șase secțiuni: introducere, problema, Ce facem, Cum lucrăm, Despre noi și contact. Nu are bloc FAQ sau oferta separată de website pentru firme fără site.

1. Privește pagina pe desktop și pe telefon. Notează textul greu de citit, elementele prea apropiate sau orice aspect neașteptat.
2. Verifică logo-ul și textele celor șase secțiuni. Spune dacă oferta centrală și felul în care este explicată reprezintă corect ce vrei să prezinți.
3. Deschide meniul și încearcă legăturile „Ce facem”, „Cum lucrăm” și „Despre noi”, apoi CTA-ul „Hai să vorbim”. Notează ce nu te duce unde te așteptai.
4. Parcurge fiecare dintre cele șase secțiuni. Verifică dacă lipsește ceva important sau dacă apare încă un bloc FAQ ori o ofertă separată de website.
5. Verifică legătura de email: aceasta pregătește un mesaj către `santiersync@gmail.com` în aplicația de email aleasă de dispozitiv. Website-ul nu trimite mesajul singur și nu promite livrarea lui.
6. Deschide linkurile către paginile juridice. Sunt proiecte în lucru pentru preview, nu informări finale.

Trimite-mi un raport simplu pentru orice observație: **pagina/modul, ce ai făcut, ce ai observat, ce ai așteptat**. Restul checklistului de mai jos este pentru etapele de integrare și lansare; nu trebuie parcurs acum.

Acest checklist este pentru proprietarul site-ului. Starea curentă a furnizorilor externi este **neverificată**; nu considera o simulare drept test de livrare reală. Notează data, URL-ul/commitul, rezultatul și dovada fără a păstra date personale ale vizitatorilor.

Pagina curentă folosește o legătură `mailto:`; nu afișează și nu activează formularul site-ului. Endpointul API păstrat în repository nu este legat de homepage și nu este configurat. Verificările tehnice de mai jos pentru formular, Turnstile, WAF și Resend sunt pentru o etapă viitoare, după o decizie separată; nu presupun că integrarea există acum.

## Preview și navigare

- [ ] Verifică preview-ul protejat pe mobil la 320, 375 și 390 px, tabletă la 768 px și desktop la 1.440 px; nu există scroll orizontal, text tăiat sau suprapuneri.
- [ ] Verifică Safari iOS și Chrome Android dacă sunt disponibile; dacă folosești doar emulare, notează asta. Verifică zoom 200% și reflow 400% pe desktop.
- [ ] Folosește numai tastatura: Tab, Shift+Tab, Enter, Space și Escape. Meniul se deschide/închide, focusul rămâne vizibil și nu există capcană.
- [ ] Confirmă linkul „Sari la conținut”, landmarks, `lang=ro`, un singur H1, ordinea heading-urilor, țintele ancorelor și absența `href="#"` folosit ca destinație.
- [ ] Verifică contrastul pentru text și controale, focusul neacoperit de header și zoom fără conținut ascuns.
- [ ] Încearcă un URL inexistent: apare pagina 404 și răspuns HTTP 404, nu un redirect fals către homepage.
- [ ] Verifică footerul, linkurile legale și `mailto:santiersync@gmail.com`; nu există telefon sau adresă stradală publică inventată.

## Email și accesibilitate

- [ ] Verifică faptul că `mailto:santiersync@gmail.com` deschide compunerea unui email în aplicația configurată pe dispozitiv. Aceasta nu înseamnă că mesajul a fost trimis sau primit.
- [ ] În etapa de lansare, proprietarul trimite un mesaj de probă din aplicația sa către inboxul real și confirmă primirea; abia atunci setează `MAILBOX_TESTED=true`.
- [ ] Nu raporta drept activă ori verificată trimiterea prin formular. Endpointul API este neconectat la homepage și păstrat pentru o etapă viitoare.
- [ ] După aprobarea și configurarea unei integrări viitoare, validează cu câmpuri obligatorii valide și cu numele/telefonul opționale goale.
- [ ] Verifică email invalid, câmpuri goale, mesaj prea scurt/prea lung, corp mare, honeypot, origin nepermis și token Turnstile absent, invalid, expirat sau refolosit. Niciun caz respins nu trimite email.
- [ ] Confirmă verificarea tokenului pe server și hostname-ul exact; după o eroare utilizatorul poate cere un token nou.
- [ ] Verifică dublu-click/retry, furnizor indisponibil, timeout, offline, răspuns non-JSON și chei lipsă. Niciun eșec nu afișează succes; datele introduse pot fi corectate/retrimise.
- [ ] Confirmă WAF-ul numai pe endpointul de contact și fără upload, destinatar controlabil de vizitator sau date personale în loguri.
- [ ] Folosește NVDA sau VoiceOver pentru meniu, secțiuni și linkul de email; verificările formularului se aplică doar după integrarea viitoare.
- [ ] Pentru o integrare API viitoare, verificațiile ei de trimitere nu înlocuiesc separat proba de email pregătit prin `mailto:` cerută de `MAILBOX_TESTED`.

## Juridic, SEO și publicare

- [ ] Confirmă operatorul real, forma sa, datele aplicabile, contactul și data revizuirii. Verifică temeiurile, furnizorii, locațiile/transferurile, retenția, drepturile și tehnologiile cu practica efectivă; redactarea din preview nu este informare finală.
- [ ] Confirmă că `DOMAIN_CONFIRMED=true` reflectă domeniul deținut/controlat, DNS-ul și HTTPS-ul; canonical-ul este exact `https://santiersync.ro`. `.com` se redirecționează doar după configurare reală.
- [ ] În preview, inspectează metadata și headerul `X-Robots-Tag`: ambele rămân noindex, iar `robots.txt` blochează crawl-ul. Nu confunda aceasta cu protecția accesului.
- [ ] În producția aprobată, inspectează canonical, titluri/descrieri specifice, OG la 1.200×630, favicon, sitemap și robots. Sitemap-ul include doar homepage și paginile publicabile.
- [ ] Verifică HTTPS și redirectul www/apex pe domeniul final, headers de securitate și lipsa cheilor în Git, HTML, JavaScript client și răspunsuri de eroare.
- [ ] Verifică CSP în preview pentru hidratarea Next.js și Turnstile: resursele externe sunt limitate la Cloudflare Turnstile, fără wildcard global. Testează din nou după fiecare integrare externă.
- [ ] Pentru o integrare API viitoare, confirmă în Vercel WAF că limita configurată se aplică doar endpointului de contact. Această verificare nu este pentru versiunea actuală.
- [ ] Rulează Lighthouse mobile de trei ori și păstrează medianele: țintă Performance ≥90, Accessibility ≥95, SEO ≥95, LCP ≤2,5s și CLS ≤0,1. Acestea sunt praguri de verificare, nu promisiuni. Urmărește INP din date reale când există trafic suficient.
- [ ] După confirmarea checklist-ului, verifică din nou statusul build-ului/deployment-ului și o trimitere reală pe domeniul public. Dacă ceva eșuează, rollback la deployment-ul anterior verificat și repetă verificările relevante.
