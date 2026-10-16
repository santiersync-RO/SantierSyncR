# Google Analytics 4 și Consentmanager

Site-ul folosește tagul Google Analytics 4 direct prin `gtag.js`, cu ID-ul implicit `G-LGQ4TNEBZV`. Google Tag Manager nu este instalat și nu este adăugată o dependență npm. Consentmanager afișează bannerul și gestionează alegerea vizitatorului; codul site-ului nu stochează o preferință proprie.

## Activare și limite

Scriptul autoblocking Consentmanager și componenta de legătură sunt disponibile numai când `DEPLOYMENT_STAGE=live`, nu este activă previzualizarea Sanity, deploymentul nu este Vercel Preview și mediul este Production. Pentru localhost în development, sunt necesare `GA_ALLOW_LOCAL_TESTING=true`, `NODE_ENV` diferit de `production` și gazda `localhost` sau `127.0.0.1`. Setarea este `false` implicit; revino la `false` după verificarea locală. Demo, preview și draft rămân excluse. În configurația curentă `DEPLOYMENT_STAGE=demo`, CMP și GA sunt dezactivate în producție. Activarea indexării publice nu schimbă această condiție. Nu au fost schimbate credențiale sau flaguri GA/CMP.

CMP-ul este încărcat independent de validitatea ID-ului GA. `GA_MEASUREMENT_ID` poate suprascrie ID-ul implicit; formatul acceptat este `G-` urmat de litere mari sau cifre. O valoare explicită invalidă dezactivează numai Google Analytics. ID-ul de măsurare este public, nu un secret.

În cod, autoblockerul Consentmanager este un script sincron static și primul script din HTML-ul `head`; nu folosește `async`, `defer` sau `next/script`. Un bootstrap Consent Mode default denied urmează scriptul CMP și nu înlocuiește comenzile CMP deja puse în `dataLayer`. Dacă API-ul CMP lipsește, starea nu poate fi citită sau nu există alegere salvată, GA nu pornește. Datele CMP sunt verificate prin API-ul public `__cmp`, iar Google Analytics este permis numai când `consentStatus.consentExists` este `true` și `vendorConsents.s26` este `true`. API-ul public și comenzile sale sunt descrise în [JavaScript API Consentmanager](https://www.help.consentmanager.net/books/cmp/page/javascript-api).

Butonul persistent „Preferințe cookies” deschide managerul Consentmanager cu `showScreenAdvanced`. Alegerea, persistența și termenul ei sunt gestionate de contul și configurația CMP. Nu presupune sau documenta o durată/cookie CMP până când operatorul nu confirmă setarea efectivă.

## Configurare necesară în Consentmanager și GA4

Proprietarul trebuie să efectueze aceste setări în conturile sale înainte de publicare; integrarea nu accesează sau modifică automat conturile.

1. Configurează și publică domeniul, limba română și versiunea CMP potrivită website-ului. Confirmă bannerul, categoriile și centrul de preferințe.
2. În lista de furnizori, confirmă că Google Analytics este furnizorul `s26` și este atribuit scopului de statistici/Analytics. Activează integrarea Google Consent Mode în Consentmanager; lasă furnizorii și integrările Google Ads dezactivate.
3. Folosește Consent Mode v2 în modul Basic: GA este introdus numai după acordul salvat pentru `s26`. În Tag Assistant confirmă că `analytics_storage` devine granted numai după acceptarea Analytics, iar `ad_storage`, `ad_user_data` și `ad_personalization` rămân denied. Opțiunile `allow_google_signals` și `allow_ad_personalization_signals` sunt false în configurația tagului.
4. În fluxul Web GA4, dezactivează complet „Enhanced measurement”. Evenimentele automate pot include linkuri externe și interacțiuni; un URL `mailto:` poate conține valori completate de vizitator. Nu urmărim aceste interacțiuni în această etapă. Documentația oficială descrie [Enhanced measurement și pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views).
5. Confirmă perioada de păstrare configurată în proprietatea GA4 și noteaz-o în informarea publică după ce setarea reală este verificată. Nu este presupusă o perioadă aici.

Ghidurile oficiale pentru [instalarea directă gtag.js](https://developers.google.com/tag-platform/gtagjs) și [modul de consimțământ](https://developers.google.com/tag-platform/security/guides/consent) descriu integrarea Google. Documentația Consentmanager pentru [autoblocking](https://www.help.consentmanager.net/books/cmp/page/automatic-blocking-of-codes-and-cookies), [evenimente CMP](https://www.help.consentmanager.net/books/cmp/page/cmp-events) și [Google Consent Mode cu autoblocking](https://www.help.consentmanager.net/books/cmp/page/working-with-google-consent-mode-v2-automatic-blocking-code) descrie ordinea și setările CMP.

## Evenimente și date

După confirmarea consimțământului, codul trimite un `page_view` la încărcarea rutei curente și la fiecare schimbare de rută Next.js, o singură dată pe cale. `page_location` și `page_referrer` sunt limitate la origine și cale; query string, fragmentul și credențialele URL nu sunt trimise. Parametrii UTM și GCLID nu sunt păstrați, deci atribuirea campaniilor nu este configurată; aceasta necesită o decizie și configurare separată înainte de campanii. Evenimentele personalizate de mai jos nu sunt configurate drept conversii în GA4. Formularul folosește API-ul numai dacă este activat cu toate credențialele și protecțiile necesare; altfel butonul de trimitere este dezactivat și sunt afișate linkuri separate către e-mailul public.

La refuz sau retragere, flagul Google este dezactivat, cookie-urile Analytics accesibile pe domeniul curent sunt șterse, iar dacă CMP confirmă o alegere salvată, pagina se reîncarcă pentru a opri trackerul deja încărcat. Cookie-uri GA existente din utilizări anterioare pot fi prezente înainte de acord și sunt șterse la refuz când sunt accesibile. Retragerea nu șterge datele deja primite de Google. CMP gestionează separat propria persistență; verifică setarea ei reală.

Evenimentele de produs disponibile sunt `calendar_open` și `contact_submit_success`. Se trimit numai dacă `consentStatus.consentExists === true`, `vendorConsents.s26 === true`, trackerul GA a fost inițializat, `gtag` există și dezactivarea GA este `false`. Un eveniment declanșat înainte de acord sau când starea CMP nu poate fi citită este eliminat, nu pus în coadă pentru trimitere ulterioară. Parametrii sunt limitați la numele evenimentului și o cale statică (`/` sau `/programare`); nu se transmit valori din formular, e-mailuri, referer, query string, hash sau identificatori de cerere.

Deschiderea calendarului înregistrează numai `calendar_open`; nu înseamnă rezervare confirmată. Webhook-ul Cal.com semnat este sursa operațională pentru o rezervare confirmată, însă nu există o legătură verificată între webhook și un eveniment GA4 de conversie. Nu se trimite `booking_confirmed` și nu sunt configurate conversii GA4. Trimiterea formularului înregistrează `contact_submit_success` numai după succesul real al endpointului.

## Listă manuală pentru proprietar

Acești pași nu au fost executați de implementare; proprietarul trebuie să îi verifice înainte de publicare.

1. În View Source, confirmă că scriptul sincron Consentmanager este primul script din `<head>`, înaintea scripturilor Next sau Google, și că este intact după randarea și hidratarea Next.js. Verifică și Console pentru erori de hidratare sau CSP.
2. Cu CMP blocat înainte de încărcarea paginii sau înainte de alegerea vizitatorului, verifică în Network că nu se încarcă `gtag.js` și nu există cereri Google Analytics. Pentru a verifica o alegere salvată cu CMP indisponibil, blochează cererile CMP și reîncarcă pagina; blocarea rețelei după inițializare nu elimină API-ul CMP deja disponibil în pagină. Confirmă că bannerul CMP și butonul de preferințe funcționează când serviciul CMP este disponibil.
3. Acceptă Analytics, reîncarcă pagina și verifică în Tag Assistant că numai după alegerea salvată apare tagul `G-LGQ4TNEBZV`; confirmă stările de consimțământ descrise mai sus. Blochează temporar `gtag.js`, apoi folosește „Preferințe cookies” și verifică faptul că tagul poate fi reîncercat după restabilirea accesului.
4. Navighează pe mai multe rute fără reload și verifică un singur `page_view` pe cale, fără query string, fragment, date de formular sau valori `mailto:`.
5. Refuză sau retrage consimțământul în managerul de preferințe; verifică oprirea cererilor Analytics, ștergerea cookie-urilor GA accesibile și comportamentul la reload. După acceptare salvată, verifică din nou starea fail-closed când citirea CMP devine necunoscută la următorul callback de consimțământ sau la navigarea următoare.
6. Blochează stocarea browserului și repetă fluxurile CMP; confirmă că un rezultat necunoscut nu pornește tagul.
7. Repetă verificarea pe demo, Vercel Preview, preview Sanity și localhost fără `GA_ALLOW_LOCAL_TESTING=true`; CMP și GA trebuie să rămână dezactivate acolo.
