# Testare manuală înainte de publicare

## Prima rundă — versiunea locală

Deschide [versiunea locală](http://127.0.0.1:3000) și fă doar această verificare inițială, fără code review. Homepage-ul urmează macheta cu șase secțiuni: introducere, problema, Ce facem, Cum lucrăm, Despre noi și contact. Nu are bloc FAQ sau oferta separată de website pentru firme fără site.

1. Privește pagina pe desktop și pe telefon. Notează textul greu de citit, elementele prea apropiate sau orice aspect neașteptat.
2. Verifică logo-ul și textele celor șase secțiuni. Spune dacă oferta centrală și felul în care este explicată reprezintă corect ce vrei să prezinți.
3. Deschide meniul și încearcă legăturile „Ce facem”, „Cum lucrăm” și „Despre noi”, apoi CTA-ul „Hai să vorbim”. Notează ce nu te duce unde te așteptai.
4. Parcurge fiecare dintre cele șase secțiuni. Verifică dacă lipsește ceva important sau dacă apare încă un bloc FAQ ori o ofertă separată de website.
5. Verifică formularul de contact. În producția curentă, până la configurarea credențialelor, formularul rămâne dezactivat și oferă e-mailul public ca alternativă; site-ul nu transmite valorile introduse. Când API-ul este activat într-un mediu de test, verifică trimiterea prin formular separat.
6. Deschide politica de confidențialitate: versiunea disponibilă public este factuală, provizorie și `noindex` cât timp revizuirea juridică nu este completă. Pagina cu informații legale rămâne ascunsă până la confirmarea datelor operatorului.

Trimite-mi un raport simplu pentru orice observație: **pagina/modul, ce ai făcut, ce ai observat, ce ai așteptat**. Restul checklistului de mai jos este pentru etapele de integrare și lansare; nu trebuie parcurs acum.

Acest checklist este pentru proprietarul site-ului. Starea curentă a furnizorilor externi este **neverificată**; nu considera o simulare drept test de livrare reală. Notează data, URL-ul/commitul, rezultatul și dovada fără a păstra date personale ale vizitatorilor.

Homepage-ul folosește formularul direct al aplicației când acesta este activat și configurat; formularul de producție rămâne dezactivat până la configurarea și verificarea credențialelor Resend și Turnstile. În starea dezactivată, interfața oferă e-mailul ca alternativă și nu transmite datele completate. Verificările tehnice de mai jos se aplică numai unui mediu în care activarea a fost configurată în mod real.

## Preview și navigare

- [ ] Verifică preview-ul protejat pe mobil la 320, 375 și 390 px, tabletă la 768 px și desktop la 1.440 px; nu există scroll orizontal, text tăiat sau suprapuneri.
- [ ] Verifică Safari iOS și Chrome Android dacă sunt disponibile; dacă folosești doar emulare, notează asta. Verifică zoom 200% și reflow 400% pe desktop.
- [ ] Folosește numai tastatura: Tab, Shift+Tab, Enter, Space și Escape. Meniul se deschide/închide, focusul rămâne vizibil și nu există capcană.
- [ ] Confirmă linkul „Sari la conținut”, landmarks, `lang=ro`, un singur H1, ordinea heading-urilor, țintele ancorelor și absența `href="#"` folosit ca destinație.
- [ ] Verifică contrastul pentru text și controale, focusul neacoperit de header și zoom fără conținut ascuns.
- [ ] Încearcă un URL inexistent: apare pagina 404 și răspuns HTTP 404, nu un redirect fals către homepage.
- [ ] Verifică footerul, linkurile legale și `mailto:santiersync@gmail.com`; nu există telefon sau adresă stradală publică inventată.

## Email și accesibilitate

- [ ] Verifică faptul că e-mailul alternativ deschide compunerea unui mesaj către inboxul public. Aceasta nu înseamnă că mesajul a fost trimis sau primit.
- [ ] Proprietarul trimite manual un mesaj de probă către inboxul real și confirmă primirea; abia atunci setează `MAILBOX_TESTED=true`. Succesul unui răspuns API nu înlocuiește această probă.
- [ ] Până la configurarea furnizorilor, nu raporta drept activă trimiterea API în producție. Când API-ul este activat într-un mediu de test, validează cu câmpuri obligatorii valide și cu numele/telefonul opționale goale.
- [ ] Verifică email invalid, câmpuri goale, mesaj prea scurt/prea lung, corp mare, honeypot, origin nepermis și token Turnstile absent, invalid, expirat sau refolosit. Niciun caz respins nu trimite email.
- [ ] Confirmă verificarea tokenului pe server și hostname-ul exact; după o eroare utilizatorul poate cere un token nou.
- [ ] Verifică dublu-click/retry, furnizor indisponibil, timeout, offline, răspuns non-JSON și chei lipsă. Niciun eșec nu afișează succes; datele introduse pot fi corectate/retrimise.
- [ ] WAF este o măsură suplimentară opțională; dacă este configurat, verifică faptul că regula se aplică numai endpointului de contact și că nu apar date personale în loguri.
- [ ] Folosește NVDA sau VoiceOver pentru meniu, secțiuni, formularul activ și linkul alternativ de e-mail.

## Juridic, SEO și publicare

- [ ] Confirmă operatorul real, forma sa, datele aplicabile, contactul și data revizuirii. Verifică temeiurile, furnizorii, locațiile/transferurile, retenția, drepturile și tehnologiile cu practica efectivă; redactarea din preview nu este informare finală.
- [ ] Confirmă că `DOMAIN_CONFIRMED=true` reflectă domeniul deținut/controlat, DNS-ul și HTTPS-ul; canonical-ul este exact `https://santiersync.ro`. `.com` se redirecționează doar după configurare reală.
- [ ] În preview, inspectează metadata și headerul `X-Robots-Tag`: ambele rămân noindex, iar `robots.txt` blochează crawl-ul. Nu confunda aceasta cu protecția accesului.
- [ ] În producția aprobată, inspectează canonical, titluri/descrieri specifice, OG la 1.200×630, favicon, sitemap și robots. Sitemap-ul include doar homepage și paginile publicabile.
- [ ] Verifică HTTPS și redirectul www/apex pe domeniul final, headers de securitate și lipsa cheilor în Git, HTML, JavaScript client și răspunsuri de eroare.
- [ ] Verifică CSP în preview pentru hidratarea Next.js și Turnstile: resursele externe sunt limitate la Cloudflare Turnstile, fără wildcard global. Testează din nou după fiecare integrare externă.
- [ ] Dacă există o regulă WAF, confirmă în Vercel că limita se aplică doar endpointului de contact; WAF nu este obligatoriu pentru activarea API-ului.
- [ ] Rulează Lighthouse mobile de trei ori și păstrează medianele: țintă Performance ≥90, Accessibility ≥95, SEO ≥95, LCP ≤2,5s și CLS ≤0,1. Acestea sunt praguri de verificare, nu promisiuni. Urmărește INP din date reale când există trafic suficient.
- [ ] După confirmarea checklist-ului, verifică din nou statusul build-ului/deployment-ului și o trimitere reală pe domeniul public. Dacă ceva eșuează, rollback la deployment-ul anterior verificat și repetă verificările relevante.
